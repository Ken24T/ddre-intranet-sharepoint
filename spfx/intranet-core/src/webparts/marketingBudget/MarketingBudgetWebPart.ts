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
import type { IBudgetRepository } from "./services/IBudgetRepository";
import type { IAuditLogger } from "./services/IAuditLogger";
import { getSPFI, createRepository } from "./services/RepositoryFactory";
import { resolveUserRole } from "./services/RoleResolver";
import { DexieAuditLogger } from "./services/DexieAuditLogger";
import { DexieBudgetTemplateService } from "./services/DexieBudgetTemplateService";
import { AuditedBudgetRepository } from "./services/AuditedBudgetRepository";
import type { UserRole } from "./models/permissions";

export interface IMarketingBudgetWebPartProps {
  description: string;
}

export default class MarketingBudgetWebPart extends BaseClientSideWebPart<IMarketingBudgetWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _repository!: IBudgetRepository;
  private _auditLogger!: IAuditLogger;
  private _templateService = new DexieBudgetTemplateService();
  private _userRole: UserRole = 'viewer';

  protected async onInit(): Promise<void> {
    await super.onInit();

    // Initialise PnPjs and create the SP List repository.
    // Falls back to DexieBudgetRepository if context is unavailable.
    const sp = getSPFI(this.context);
    const baseRepo = createRepository(sp);
    this._auditLogger = new DexieAuditLogger();
    this._repository = new AuditedBudgetRepository(
      baseRepo,
      this._auditLogger,
      this.context.pageContext.user.displayName,
    );

    // Resolve user role from Entra ID / SharePoint group membership.
    this._userRole = await resolveUserRole(sp);
  }

  public render(): void {
    const element: React.ReactElement<IMarketingBudgetProps> =
      React.createElement(MarketingBudget, {
        userDisplayName: this.context.pageContext.user.displayName,
        isDarkTheme: this._isDarkTheme,
        isSharePointContext: true,
        repository: this._repository,
        auditLogger: this._auditLogger,
        templateService: this._templateService,
        userRole: this._userRole,
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
