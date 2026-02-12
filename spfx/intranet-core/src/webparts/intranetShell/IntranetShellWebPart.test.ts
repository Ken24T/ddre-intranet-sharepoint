jest.mock("@pnp/sp", () => ({
  spfi: jest.fn(() => ({})),
  SPFx: jest.fn(),
}));
jest.mock("@pnp/sp/webs", () => ({}));
jest.mock("@pnp/sp/site-users/web", () => ({}));
jest.mock("@pnp/sp/site-groups", () => ({}));

jest.mock("./components/services/ShellGroupResolver", () => ({
  resolveShellAccess: jest.fn(() =>
    Promise.resolve({
      isAdmin: false,
      visibleHubs: [
        "home",
        "library",
        "administration",
        "office",
        "property-management",
        "sales",
      ],
    }),
  ),
  SIDEBAR_HUB_KEYS: [
    "home",
    "library",
    "administration",
    "office",
    "property-management",
    "sales",
  ],
}));

jest.mock("@microsoft/sp-webpart-base", () => {
  class BaseClientSideWebPart {
    public context: unknown;
    public properties: Record<string, unknown>;
    public domElement: HTMLElement;

    public constructor() {
      this.context = {};
      this.properties = {};
      this.domElement = document.createElement("div");
    }
  }

  return { BaseClientSideWebPart };
});

jest.mock("@microsoft/sp-core-library", () => {
  return {
    Version: {
      parse: (value: string) => ({ value }),
    },
  };
});

const propertyPaneTextFieldMock = jest.fn(
  (_targetProperty: string, _properties: unknown) => ({ type: "TextField" }),
);

jest.mock("@microsoft/sp-property-pane", () => {
  return {
    PropertyPaneTextField: (targetProperty: string, properties: unknown) =>
      propertyPaneTextFieldMock(targetProperty, properties),
  };
});

jest.mock(
  "IntranetShellWebPartStrings",
  () => {
    return {
      PropertyPaneDescription: "Description",
      BasicGroupName: "Group Name",
      DescriptionFieldLabel: "Description Field",
      AppLocalEnvironmentSharePoint: "SP local",
      AppSharePointEnvironment: "SP hosted",
      AppLocalEnvironmentTeams: "Teams local",
      AppTeamsTabEnvironment: "Teams hosted",
      AppLocalEnvironmentOffice: "Office local",
      AppOfficeEnvironment: "Office hosted",
      AppLocalEnvironmentOutlook: "Outlook local",
      AppOutlookEnvironment: "Outlook hosted",
      UnknownEnvironment: "Unknown",
    };
  },
  { virtual: true },
);

const React = jest.requireActual<typeof import("react")>("react");
const ReactDom = jest.requireActual<typeof import("react-dom")>("react-dom");

import IntranetShellWebPart from "./IntranetShellWebPart";

type IntranetShellWebPartInstance = {
  context: unknown;
  properties: { description: string };
  domElement: HTMLElement;
  render(): void;
  onDispose(): void;
  getPropertyPaneConfiguration(): unknown;
  onInit(): Promise<void>;
  _environmentMessage: string;
};

describe("IntranetShellWebPart", () => {
  beforeEach(() => {
    jest.spyOn(ReactDom, "render").mockImplementation(() => undefined);
    jest
      .spyOn(ReactDom, "unmountComponentAtNode")
      .mockImplementation(() => true);
    jest.spyOn(React, "createElement");

    propertyPaneTextFieldMock.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the React component with expected props", () => {
    const webPart = new (IntranetShellWebPart as unknown as {
      new (): IntranetShellWebPartInstance;
    })();

    webPart.properties = { description: "Hello" };
    (webPart as unknown as { manifest: { version: string } }).manifest = {
      version: "0.4.0",
    };
    webPart.context = {
      isServedFromLocalhost: true,
      pageContext: {
        user: {
          displayName: "Jane Doe",
          email: "jane.doe@example.com",
        },
        web: {
          title: "DDRE Intranet",
        },
      },
      sdks: {},
    };

    webPart.render();

    expect(React.createElement).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        userDisplayName: "Jane Doe",
        userEmail: "jane.doe@example.com",
        siteTitle: "DDRE Intranet",
        appVersion: "0.4.0",
        isDarkTheme: false,
        hasTeamsContext: false,
      }),
    );

    expect(ReactDom.render).toHaveBeenCalledWith(
      expect.any(Object),
      webPart.domElement,
    );
  });

  it("unmounts on dispose", () => {
    const webPart = new (IntranetShellWebPart as unknown as {
      new (): IntranetShellWebPartInstance;
    })();

    webPart.onDispose();

    expect(ReactDom.unmountComponentAtNode).toHaveBeenCalledWith(
      webPart.domElement,
    );
  });

  it("builds the property pane with a description field", () => {
    const webPart = new (IntranetShellWebPart as unknown as {
      new (): IntranetShellWebPartInstance;
    })();

    const config = webPart.getPropertyPaneConfiguration() as {
      pages: Array<{ groups: Array<unknown> }>;
    };

    expect(config.pages).toHaveLength(1);
    expect(config.pages[0].groups).toHaveLength(1);

    expect(propertyPaneTextFieldMock).toHaveBeenCalledWith("description", {
      label: "Description Field",
    });
  });

  it("sets SharePoint environment message during onInit", async () => {
    const webPart = new (IntranetShellWebPart as unknown as {
      new (): IntranetShellWebPartInstance;
    })();

    webPart.context = {
      isServedFromLocalhost: true,
      pageContext: { user: { displayName: "Jane" } },
      sdks: {},
    };

    await webPart.onInit();

    expect(webPart._environmentMessage).toBe("SP local");
  });

  it("sets Teams environment message during onInit", async () => {
    const webPart = new (IntranetShellWebPart as unknown as {
      new (): IntranetShellWebPartInstance;
    })();

    webPart.context = {
      isServedFromLocalhost: false,
      pageContext: { user: { displayName: "Jane" } },
      sdks: {
        microsoftTeams: {
          teamsJs: {
            app: {
              getContext: () =>
                Promise.resolve({
                  app: {
                    host: {
                      name: "Teams",
                    },
                  },
                }),
            },
          },
        },
      },
    };

    await webPart.onInit();

    expect(webPart._environmentMessage).toBe("Teams hosted");
  });
});
