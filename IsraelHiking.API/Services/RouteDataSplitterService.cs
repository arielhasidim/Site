﻿using System;
using System.Collections.Generic;
using System.Linq;
using GeoAPI.CoordinateSystems.Transformations;
using GeoAPI.Geometries;
using IsraelHiking.API.Executors;
using IsraelHiking.Common;
using NetTopologySuite.Geometries;
using NetTopologySuite.Simplify;
using Microsoft.Extensions.Options;

namespace IsraelHiking.API.Services
{
    ///<inheritdoc/>
    public class RouteDataSplitterService : IRouteDataSplitterService
    {
        private readonly IMathTransform _wgs84ItmMathTransform;
        private readonly ConfigurationData _options;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="itmWgs84MathTransfromFactory"></param>
        /// <param name="options"></param>
        public RouteDataSplitterService(IItmWgs84MathTransfromFactory itmWgs84MathTransfromFactory,
            IOptions<ConfigurationData> options)
        {
            _wgs84ItmMathTransform = itmWgs84MathTransfromFactory.CreateInverse();
            _options = options.Value;
        }

        ///<inheritdoc/>
        public RouteData Split(RouteData routeData)
        {
            var allRoutePoints = routeData.Segments.SelectMany(s => s.Latlngs).ToList();
            var coordinates = ToWgs84Coordinates(allRoutePoints);
            int maximumPoints = Math.Max(3, Math.Min((int)(new LineString(coordinates).Length / _options.MinimalSegmentLength), _options.MaxSegmentsNumber));
            var currentDistanceTolerance = _options.InitialSplitSimplificationDistanceTolerace;
            Coordinate[] simplifiedCoordinates;
            do
            {
                simplifiedCoordinates = DouglasPeuckerLineSimplifier.Simplify(coordinates, currentDistanceTolerance);
                currentDistanceTolerance *= 2;
            } while (simplifiedCoordinates.Length > maximumPoints);

            var manipulatedRouteData = new RouteData
            {
                Segments = new List<RouteSegmentData> { new RouteSegmentData
                    {
                        RoutePoint = allRoutePoints.First(),
                        Latlngs = new List<LatLngTime> { allRoutePoints.First(), allRoutePoints.First() }
                    } },
                Name = routeData.Name
            };

            for (int index = 1; index < simplifiedCoordinates.Length; index++)
            {
                var currentIndex = coordinates.ToList().IndexOf(simplifiedCoordinates[index]);
                coordinates = coordinates.Skip(currentIndex).ToArray();

                var latLngs = allRoutePoints.Take(currentIndex + 1).ToList();
                allRoutePoints = allRoutePoints.Skip(currentIndex).ToList();
                manipulatedRouteData.Segments.Add(new RouteSegmentData
                {
                    Latlngs = latLngs,
                    RoutePoint = latLngs.Last()
                });
            }

            return manipulatedRouteData;
        }

        private Coordinate[] ToWgs84Coordinates(IEnumerable<LatLng> latLngs)
        {
            return latLngs.Select(latLng => _wgs84ItmMathTransform.Transform(new Coordinate { X = latLng.Lng, Y = latLng.Lat })).ToArray();
        }
    }
}
