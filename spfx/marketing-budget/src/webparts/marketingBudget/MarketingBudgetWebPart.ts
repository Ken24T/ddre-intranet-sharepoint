import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";

import * as strings from "MarketingBudgetWebPartStrings";
import MarketingBudget from "./components/MarketingBudget";
import type { IMarketingBudgetProps } from "./components/IMarketingBudgetProps";
import { DexieBudgetRepository } from "../../services/DexieBudgetRepository";
import type { IBudgetRepository } from "../../services/IBudgetRepository";

export interface IMarketingBudgetWebPartProps {
  description: string;
}

export default class MarketingBudgetWebPart extends BaseClientSideWebPart<IMarketingBudgetWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _repository: IBudgetRepository;

  public constructor() {
    super();
    this._repository = new DexieBudgetRepository();
  }

  public render(): void {
    const element: React.ReactElement<IMarketingBudgetProps> =
      React.createElement(MarketingBudget, {
        userDisplayName: this.context.pageContext.user.displayName,
        isDarkTheme: this._isDarkTheme,
        isSharePointContext: true,
        repository: this._repository,
      });

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty(
        "--bodyText",
        semanticColors.bodyText || null,
      );
      this.domElement.style.setProperty("--link", semanticColors.link || null);
      this.domElement.style.setProperty(
        "--linkHovered",
        semanticColors.linkHovered || null,
      );
    }
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
          header: {
            description: strings.PropertyPaneDescription,
          },
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
