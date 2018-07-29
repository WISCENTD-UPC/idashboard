import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { NgxDhis2HttpClientService } from '@hisptz/ngx-dhis2-http-client';
import * as _ from 'lodash';

import { Dashboard } from '../models';
import { map, switchMap, catchError, mergeMap } from 'rxjs/operators';
import { UtilService } from './util.service';
import { DashboardSettings } from '../models/dashboard-settings.model';
@Injectable({ providedIn: 'root' })
export class DashboardService {
  dashboardUrlFields: string;
  constructor(
    private httpClient: NgxDhis2HttpClientService,
    private utilService: UtilService
  ) {
    this.dashboardUrlFields =
      '?fields=id,name,description,publicAccess,access,externalAccess,created,lastUpdated,favorite,' +
      'user[id,name],dashboardItems[id,type,created,lastUpdated,shape,appKey,chart[id,displayName],' +
      'map[id,displayName],reportTable[id,displayName],eventReport[id,displayName],eventChart[id,displayName]]&paging=false';
  }

  loadAll(dashboardSettings: DashboardSettings): Observable<Dashboard[]> {
    return dashboardSettings && dashboardSettings.useDataStoreAsSource
      ? this.loadFromDataStore(dashboardSettings)
      : this.loadFromApi();
  }

  loadFromApi() {
    return this.httpClient
      .get(`dashboards.json${this.dashboardUrlFields}`, true)
      .pipe(
        map((dashboardResponse: any) => dashboardResponse.dashboards || [])
      );
  }

  loadFromDataStore(dashboardSettings: DashboardSettings) {
    return this.httpClient.get('dataStore/dashboards').pipe(
      mergeMap((dashboardIds: Array<string>) =>
        forkJoin(
          _.map(dashboardIds, dashboardId =>
            this.httpClient.get(`dataStore/dashboards/${dashboardId}`)
          )
        ).pipe(
          map((dashboards: any[]) =>
            _.filter(
              dashboards,
              dashboard => dashboard.namespace === dashboardSettings.id
            )
          )
        )
      ),
      catchError(() => of([]))
    );
  }

  load(id: string, customFields?: string): Observable<Dashboard[]> {
    return this.httpClient.get(
      `dashboards/${id}.json${customFields || this.dashboardUrlFields}`,
      true
    );
  }

  create(dashboard: Dashboard, dashboardSettings: DashboardSettings) {
    return dashboardSettings && dashboardSettings.useDataStoreAsSource
      ? this.httpClient.post(`dataStore/dashboards/${dashboard.id}`, {
          ...dashboard,
          namespace: dashboardSettings.id
        })
      : this.httpClient.post('dashboard.json', dashboard);
  }

  bookmarkDashboard(
    dashboardId: string,
    bookmarked: boolean,
    supportBookmark: boolean,
    currentUserId: string
  ) {
    return supportBookmark
      ? this._bookmarkDashboardByApi(dashboardId, bookmarked)
      : this._bookmarkDashboardByDataStore(
          dashboardId,
          currentUserId,
          bookmarked
        );
  }

  addDashboardItem(dashboardId: string, dashboardItem: any) {
    // TODO find best way for this as this approach is deprecated
    return this.utilService.getUniqueId().pipe(
      switchMap((uniqueId: string) =>
        this.load(
          dashboardId,
          '?fields=id,created,lastUpdated,externalAccess,publicAccess,favorites,' +
            'translations,name,userAccesses,userGroupAccesses,dashboardItems[id,type,appKey,chart[id,name],' +
            'map[id,name],reportTable[id,name],eventReport[id,name],eventChart[id,name]]'
        ).pipe(
          switchMap((dashboard: any) => {
            const dashboardItemToAdd = { ...dashboardItem, id: uniqueId };
            return this.httpClient
              .put(`dashboards/${dashboardId}?mergeMode=MERGE`, {
                ...dashboard,
                dashboardItems: [
                  dashboardItemToAdd,
                  ...dashboard.dashboardItems
                ]
              })
              .pipe(
                map(() => {
                  return { dashboardId, dashboardItem: dashboardItemToAdd };
                })
              );
          })
        )
      )
    );
  }

  private _bookmarkDashboardByApi(dashboardId: string, bookmarked: boolean) {
    return bookmarked
      ? this.httpClient.post(`dashboards/${dashboardId}/favorite`, {})
      : this.httpClient.delete(`dashboards/${dashboardId}/favorite`);
  }

  private _bookmarkDashboardByDataStore(
    dashboardId: string,
    currentUserId: string,
    bookmarked: boolean
  ) {
    return this.httpClient.get(`dataStore/dashboards/${dashboardId}`).pipe(
      switchMap((dashboardOption: any) =>
        this.httpClient.put(`dataStore/dashboards/${dashboardId}`, {
          ...dashboardOption,
          bookmarks: bookmarked
            ? dashboardOption.bookmarks.indexOf(currentUserId) === -1
              ? [...dashboardOption.bookmarks, currentUserId]
              : [...dashboardOption.bookmarks]
            : _.filter(
                dashboardOption.bookmarks,
                bookmark => bookmark !== currentUserId
              )
        })
      ),
      catchError(() =>
        this.httpClient.post(`dataStore/dashboards/${dashboardId}`, {
          id: dashboardId,
          bookmarks: [currentUserId]
        })
      )
    );
  }
}
