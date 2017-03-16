export interface Schema {
    Navigation?: INavigation;
    CustomActions?: ICustomAction[];
    ComposedLook?: IComposedLook;
    WebSettings?: IWebSettings;
    Features?: IFeature[];
    Lists?: IList[];
    Pages?: IPage[];

    [key: string]: any;
}

export default Schema;

export interface IPage {
    Folder: string;
    Url: string;
    Fields?: { [key: string]: string };
}

export interface IFeature {
    id: string;
    deactivate: boolean;
    force: boolean;
}

export interface IComposedLook {
    ColorPaletteUrl: string;
    FontSchemeUrl: string;
    BackgroundImageUrl: string;
}

export interface ICustomAction {
    Name: string;
    Description?: string;
    Title: string;
    Location: string;
    Url: string;

    [key: string]: string;
}

export interface IWebSettings {
    WelcomePage?: string;
    AlternateCssUrl?: string;
    SaveSiteAsTemplateEnabled?: boolean;
    MasterUrl?: string;
    CustomMasterUrl?: string;
    RecycleBinEnabled?: boolean;
    TreeViewEnabled?: boolean;
    QuickLaunchEnabled?: boolean;

    [key: string]: string | boolean;
}

export interface INavigation {
    QuickLaunch?: INavigationNode[];
    TopNavigationBar?: INavigationNode[];
}

export interface INavigationNode {
    Title: string;
    Url: string;
    Children?: INavigationNode[];
}

export interface IList {
    Title: string;
    Description: string;
    Template: number;
    ContentTypesEnabled: boolean;
    RemoveExistingContentTypes?: boolean;
    ContentTypeBindings?: IContentTypeBinding[];
    Fields?: string[];
    Views?: IListView[];

    AdditionalSettings?: {
        DefaultContentApprovalWorkflowId?: string;
        DefaultDisplayFormUrl?: string;
        DefaultEditFormUrl?: string;
        DefaultNewFormUrl?: string;
        Description?: string;
        Direction?: string;
        DocumentTemplateUrl?: string;
        /**
         * Reader = 0; Author = 1; Approver = 2.
         */
        DraftVersionVisibility?: number;
        EnableAttachments?: boolean;
        EnableFolderCreation?: boolean;
        EnableMinorVersions?: boolean;
        EnableModeration?: boolean;
        EnableVersioning?: boolean;
        ForceCheckout?: boolean;
        Hidden?: boolean;
        IrmEnabled?: boolean;
        IrmExpire?: boolean;
        IrmReject?: boolean;
        IsApplicationList?: boolean;
        NoCrawl?: boolean;
        OnQuickLaunch?: boolean;
        Title?: string;
        ValidationFormula?: string;
        ValidationMessage?: string;

        [key: string]: string | boolean | number;
    };
}

export interface IContentTypeBinding {
    ContentTypeID: string;
    Name?: string;
}

export interface IListView {
    Title: string;
    PersonalView?: boolean;
    ViewFields?: string[];
    AdditionalSettings?: {
        ViewQuery?: string;
        RowLimit?: number;
        Paged?: boolean;
    };
}