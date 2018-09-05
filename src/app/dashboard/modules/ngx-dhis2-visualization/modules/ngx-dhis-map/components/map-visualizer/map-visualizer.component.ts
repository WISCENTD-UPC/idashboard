import { Component, Input, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { VisualizationUiConfig, VisualizationConfig, VisualizationLayer } from '../../../../models';
import { LayerGeofeature } from '../../models/geofeature.model';
import { prepareMapContainer } from '../../helpers/mapVisualization.helper';
import {
  map as lMap,
  control as leafletControl,
  Map,
  TileLayer as LeafLetTileLayer,
  Layer as LeafLetLayer,
  LatLngExpression
} from 'leaflet';
import { getTileLayer } from '../../constants';
import { LayerType } from '../../lib/Layers';
import { convertLatitudeLongitude } from '../../helpers/latLongConvertion.helper';

@Component({
  selector: 'app-map-visualizer',
  templateUrl: './map-visualizer.component.html',
  styleUrls: ['./map-visualizer.component.scss']
})
export class MapVisualizerComponent implements OnChanges, AfterViewInit {
  @Input()
  id;
  @Input()
  visualizationLayers: Array<VisualizationLayer>;
  @Input()
  visualizationConfig: VisualizationConfig;
  @Input()
  visualizationUiConfig: VisualizationUiConfig;
  @Input()
  geofeatureEntities: { [layerId: string]: LayerGeofeature };

  public dhis2Map: Map;
  public baseMapLayer: LeafLetTileLayer;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    const { geofeatureEntities } = changes;

    // check if geofetures have been loaded.
    if (geofeatureEntities && geofeatureEntities.currentValue && Object.keys(geofeatureEntities.currentValue).length) {
      console.log(geofeatureEntities.currentValue);
    }
  }

  async ngAfterViewInit() {
    await this.initializeMapContainer();
    this.initialMapDraw();
  }

  async initializeMapContainer() {
    const { height, width, fullScreen } = this.visualizationUiConfig;
    const container = prepareMapContainer(this.id, height, width, fullScreen);
    const otherOptions = {
      zoomControl: false,
      maxZoom: 12,
      fadeAnimation: false,
      scrollWheelZoom: fullScreen,
      worldCopyJump: true
    };

    // Initialize Map after ViewInit
    this.dhis2Map = lMap(container, otherOptions);
    leafletControl.scale({ position: 'bottomleft', metric: true, updateWhenIdle: true }).addTo(this.dhis2Map);
  }

  createBaseLayer(basemap?: string) {
    const mapTileLayer = getTileLayer(basemap);
    return LayerType[mapTileLayer.type](mapTileLayer);
  }

  setLayerVisibility(isVisible: boolean, layer: LeafLetLayer) {
    if (isVisible && !this.dhis2Map.hasLayer(layer)) {
      this.dhis2Map.addLayer(layer);
    } else if (!isVisible && this.dhis2Map.hasLayer(layer)) {
      this.dhis2Map.removeLayer(layer);
    }
  }

  initialMapDraw() {
    const { basemap, zoom, latitude, longitude } = this.visualizationConfig;
    this.baseMapLayer = this.createBaseLayer(basemap);
    // Set Opacity of the base layer at the start
    // this.baseMapLayer.setOpacity(1);
    this.setLayerVisibility(true, this.baseMapLayer);
    this.drawBaseAndOverLayLayers(zoom, latitude, longitude);
  }

  drawBaseAndOverLayLayers(zoom: number = 6, latitude: string = '6.489', longitude: string = '21.885') {
    const center: LatLngExpression = [
      Number(convertLatitudeLongitude(latitude)),
      Number(convertLatitudeLongitude(longitude))
    ];

    this.dhis2Map.setView(center, zoom);
  }
}