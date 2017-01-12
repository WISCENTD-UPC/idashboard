import { Component, OnInit } from '@angular/core';
import {Dashboard} from "../../interfaces/dashboard";
import {DashboardService} from "../../providers/dashboard.service";

@Component({
  selector: 'app-dashboard-menu-items',
  templateUrl: './dashboard-menu-items.component.html',
  styleUrls: ['./dashboard-menu-items.component.css']
})
export class DashboardMenuItemsComponent implements OnInit {

  public isEditFormOpen: boolean;
  public isItemSearchOpen: boolean;
  public dashboardsLoading: boolean;
  public dashboardsError: boolean;
  public dashboards: Dashboard[];
  constructor(
     private dashboardService: DashboardService
  ) {
    this.isEditFormOpen = false;
    this.isItemSearchOpen = false;
    this.dashboardsLoading = true;
    this.dashboardsError = false;
  }

  ngOnInit() {
    this.dashboardService.all().subscribe(dashboards => {
      this.dashboards = dashboards;
      console.log(dashboards)
      this.dashboardsLoading = false;
    }, error => {
      this.dashboardsLoading = false;
      this.dashboardsError = true;
    })
  }

}