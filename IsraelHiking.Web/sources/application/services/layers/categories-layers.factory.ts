﻿import { Injectable } from "@angular/core";
import { LocalStorageService } from "ngx-store"

import { CategoriesLayer } from "./categories.layer";
import { MapService } from "../map.service";
import { ResourcesService } from "../resources.service";
import { PoiService, CategoriesType } from "../poi.service";
import { FitBoundsService } from "../fit-bounds.service";
import { SidebarService } from "../sidebar.service";


@Injectable()
export class CategoriesLayerFactory {
    private categoryLayers: Map<CategoriesType, CategoriesLayer>;

    constructor(private readonly mapService: MapService,
        private readonly resources: ResourcesService,
        private readonly localStorageService: LocalStorageService,
        private readonly poiService: PoiService,
        private readonly fitBoundsService: FitBoundsService,
        private readonly sidebarService: SidebarService) {
        this.categoryLayers = new Map<CategoriesType, CategoriesLayer>();
        for (let category of this.poiService.getCategoriesTypes()) {
            let layer = new CategoriesLayer(this.mapService,
                this.resources,
                this.localStorageService,
                this.poiService,
                this.fitBoundsService,
                this.sidebarService,
                category);
            this.categoryLayers.set(category, layer);
        }
    }

    public get(categoriesType: CategoriesType): CategoriesLayer {
        return this.categoryLayers.get(categoriesType);
    }

    public getByPoiType(isRoute: boolean) {
        return isRoute
            ? this.get("Routes")
            : this.get("Points of Interest");
    }
}