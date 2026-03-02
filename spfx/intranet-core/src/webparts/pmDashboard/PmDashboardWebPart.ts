import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import type { IReadonlyTheme } from "@microsoft/sp-component-base";

import * as strings from "PmDashboardWebPartStrings";
import { PmDashboard } from "./components/PmDashboard";
import type { IPmDashboardProps } from "./components/IPmDashboardProps";
import type { IDashboardRepository } from "./services/IDashboardRepository";
import { DexieDashboardRepository } from "./services/DexieDashboardRepository";

export interface IPmDashboardWebPartProps {
  description: string;
}

export default class PmDashboardWebPart extends BaseClientSideWebPart<IPmDashboardWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _repository!: IDashboardRepository;

  protected async onInit(): Promise<void> {
    await super.onInit();

    // Phase 1: Dexie for both dev harness and SP context.
    // Phase 2: SPListDashboardRepository when SP context is available.
    this._repository = new DexieDashboardRepository();
  }

  public render(): void {
    const element: React.ReactElement<IPmDashboardProps> = React.createElement(
      PmDashboard,
      {
        userDisplayName: this.context.pageContext.user.displayName,
        isDarkTheme: this._isDarkTheme,
        repository: this._repository,
      },
    );

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;
    this._isDarkTheme =
      !!currentTheme.isInverted;
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
