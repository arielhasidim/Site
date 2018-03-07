﻿import { Component, Input, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material";

import { ResourcesService } from "../../services/resources.service";
import { FileService } from "../../services/file.service";
import { BaseMapComponent } from "../base-map.component";
import { ImageDialogCompnent } from "../dialogs/image-dialog.component";

export interface IPoiMainInfoData {
    title: string;
    description: string;
    readOnlyDescription: string;
    url: string;
    imagesUrls: string[];
    noImageIcon: string;
    imagesFiles: File[];
}

@Component({
    selector: "poi-main-info",
    templateUrl: "./poi-main-info.component.html",
    encapsulation: ViewEncapsulation.None
})
export class PoiMainInfoComponent extends BaseMapComponent {
    @Input()
    public info: IPoiMainInfoData;

    @Input()
    public isEditMode: boolean;

    private currentImageIndex: number;

    constructor(resources: ResourcesService,
        private readonly matDialog: MatDialog,
        private readonly fileService: FileService) {
        super(resources);
        this.currentImageIndex = 0;
    }

    public imageChanged(e: any) {
        let files = this.fileService.getFilesFromEvent(e);
        for (let file of files) {
            this.info.imagesFiles.push(file);
            let reader = new FileReader();

            reader.onload = (event: any) => {
                this.info.imagesUrls.push(event.target.result);
                this.currentImageIndex = this.info.imagesUrls.length - 1;
            }

            reader.readAsDataURL(file);    
        }
    }

    public showImage() {
        let dialog = this.matDialog.open(ImageDialogCompnent);
        dialog.componentInstance.title = this.info.title;
        dialog.componentInstance.imagesUrls = [...this.info.imagesUrls];
    }

    public getCurrentImage() {
        if (this.info.imagesUrls.length === 0) {
            return null;
        }
        return this.resources.getResizedImageUrl(this.info.imagesUrls[this.currentImageIndex], 800);
    }

    public nextImage() {
        this.currentImageIndex++;
        if (this.currentImageIndex >= this.info.imagesUrls.length) {
            this.currentImageIndex = this.info.imagesUrls.length - 1;
        }
    }

    public previousImage() {
        this.currentImageIndex--;
        if (this.currentImageIndex < 0) {
            this.currentImageIndex = 0;
        }
    }
    
    public hasNext(): boolean {
        return this.currentImageIndex < this.info.imagesUrls.length - 1;
    }

    public hasPrevious(): boolean {
        return this.currentImageIndex > 0;
    }

    public getDescrition(): string {
        if (this.info.description) {
            return this.info.description;
        }
        return this.info.readOnlyDescription;
    }
}
