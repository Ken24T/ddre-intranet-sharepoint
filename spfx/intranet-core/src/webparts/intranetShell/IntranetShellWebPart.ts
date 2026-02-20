import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";

import * as strings from "IntranetShellWebPartStrings";
import { IntranetShellWithTasks } from "./components/IntranetShellWithTasks";
import { IntranetShellWrapper } from "./components/IntranetShellWrapper";
import { IIntranetShellProps } from "./components/IIntranetShellProps";
import MarketingBudget from "../marketingBudget/components/MarketingBudget";
import type { IBudgetRepository } from "../marketingBudget/services/IBudgetRepository";
import { DexieBudgetRepository } from "../marketingBudget/services/DexieBudgetRepository";
import type { UserRole } from "../marketingBudget/models/permissions";

export interface IIntranetShellWebPartProps {
  description: string;
}

export default class IntranetShellWebPart extends BaseClientSideWebPart<IIntranetShellWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";
  private _marketingBudgetRepository: IBudgetRepository = new DexieBudgetRepository();
  private _marketingBudgetUserRole: UserRole = "viewer";

  public render(): void {
    const MarketingBudgetInline: React.FC = () =>
      React.createElement(MarketingBudget, {
        userDisplayName: this.context.pageContext.user.displayName,
        isDarkTheme: this._isDarkTheme,
        isSharePointContext: true,
        repository: this._marketingBudgetRepository,
        userRole: this._marketingBudgetUserRole,
        shellBridgeOptions: { forceActive: true },
      });

    const cardDetailRenderers: Record<string, React.ComponentType> = {
      "marketing-budgets": MarketingBudgetInline,
    };

    const shellElement: React.ReactElement<IIntranetShellProps> =
      React.createElement(IntranetShellWithTasks, {
        userDisplayName: this.context.pageContext.user.displayName,
        userEmail: this.context.pageContext.user.email || '',
        siteTitle: this.context.pageContext.web.title,
        appVersion: this.manifest.version,
        isDarkTheme: this._isDarkTheme,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        cardDetailRenderers,
      });

    // Wrap shell with error handling providers (Toast, OfflineBanner)
    const element = React.createElement(IntranetShellWrapper, null, shellElement);

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    this._environmentMessage = await this._getEnvironmentMessage();

    try {
      const [repoFactory, roleResolver] = await Promise.all([
        import(
          /* webpackChunkName: 'marketing-budget-repository-factory' */ "../marketingBudget/services/RepositoryFactory"
        ),
        import(
          /* webpackChunkName: 'marketing-budget-role-resolver' */ "../marketingBudget/services/RoleResolver"
        ),
      ]);

      const sp = repoFactory.getSPFI(this.context);
      this._marketingBudgetRepository = repoFactory.createRepository(sp);
      this._marketingBudgetUserRole = await roleResolver.resolveUserRole(sp);
    } catch (error) {
      console.warn(
        "[IntranetShell] Marketing Budget repository/role init failed, falling back to viewer mode",
        error,
      );
      this._marketingBudgetRepository = new DexieBudgetRepository();
      this._marketingBudgetUserRole = "viewer";
    }
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app
        .getContext()
        .then((context) => {
          let environmentMessage: string = "";
          switch (context.app.host.name) {
            case "Office": // running in Office
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOffice
                : strings.AppOfficeEnvironment;
              break;
            case "Outlook": // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOutlook
                : strings.AppOutlookEnvironment;
              break;
            case "Teams": // running in Teams
            case "TeamsModern":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentTeams
                : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(
      this.context.isServedFromLocalhost
        ? strings.AppLocalEnvironmentSharePoint
        : strings.AppSharePointEnvironment,
    );
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
