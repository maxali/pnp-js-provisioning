import * as xmljs from "xml-js";
import { HandlerBase } from "./handlerbase";
import { IContentTypeBinding, IList, IListInstanceFieldRef, IListView } from "../schema";
import { Web, List, Logger, LogLevel } from "sp-pnp-js";

/**
 * Describes the Lists Object Handler
 */
export class Lists extends HandlerBase {
    private lists: any[];
    private tokenRegex = /{[a-z]*:[ÆØÅæøåA-za-z ]*}/g;
    /**
     * Creates a new instance of the Lists class
     */
    constructor() {
        super("Lists");
        this.lists = [];
    }

    /**
     * Provisioning lists
     *
     * @param {Web} web The web
     * @param {Array<IList>} lists The lists to provision
     */
    public ProvisionObjects(web: Web, lists: IList[]): Promise<void> {
        super.scope_started();
        return new Promise<void>((resolve, reject) => {
            lists.reduce((chain, list) => chain.then(_ => this.processList(web, list)), Promise.resolve()).then(() => {
                lists.reduce((chain, list) => chain.then(_ => this.processFields(web, list)), Promise.resolve()).then(() => {
                    lists.reduce((chain, list) => chain.then(_ => this.processFieldRefs(web, list)), Promise.resolve()).then(() => {
                        lists.reduce((chain, list) => chain.then(_ => this.processViews(web, list)), Promise.resolve()).then(() => {
                            super.scope_ended();
                            resolve();
                        });
                    });
                });
            }).catch(e => {
                super.scope_ended();
                reject(e);
            });
        });
    }

    /**
     * Processes a list
     *
     * @param {Web} web The web
     * @param {IList} list The list
     */
    private processList(web: Web, conf: IList): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            web.lists.ensure(conf.Title, conf.Description, conf.Template, conf.ContentTypesEnabled, conf.AdditionalSettings).then(({ created, list, data }) => {
                this.lists.push(data);
                if (created) {
                    Logger.log({ data: list, level: LogLevel.Info, message: `List ${conf.Title} created successfully.` });
                }
                this.processContentTypeBindings(conf, list, conf.ContentTypeBindings, conf.RemoveExistingContentTypes).then(resolve, reject);
            });
        });
    }

    /**
     * Processes content type bindings for a list
     *
     * @param {IList} conf The list configuration
     * @param {List} list The pnp list
     * @param {Array<IContentTypeBinding>} contentTypeBindings Content type bindings
     * @param {boolean} removeExisting Remove existing content type bindings
     */
    private processContentTypeBindings(conf: IList, list: List, contentTypeBindings: IContentTypeBinding[], removeExisting: boolean): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (contentTypeBindings) {
                contentTypeBindings.reduce((chain, ct) => chain.then(_ => this.processContentTypeBinding(conf, list, ct.ContentTypeID)), Promise.resolve()).then(() => {
                    if (removeExisting) {
                        let promises = [];
                        list.contentTypes.get().then(contentTypes => {
                            contentTypes.forEach(({ Id: { StringValue: ContentTypeId } }) => {
                                let shouldRemove = (contentTypeBindings.filter(ctb => ContentTypeId.indexOf(ctb.ContentTypeID) !== -1).length === 0)
                                    && (ContentTypeId.indexOf("0x0120") === -1);
                                if (shouldRemove) {
                                    Logger.write(`Removing content type ${ContentTypeId} from list ${conf.Title}`, LogLevel.Info);
                                    promises.push(list.contentTypes.getById(ContentTypeId).delete());
                                }
                            });
                        });
                        Promise.all(promises).then(resolve, reject);
                    } else {
                        resolve();
                    }
                }).catch(e => {
                    reject(e);
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Processes a content type binding for a list
     *
     * @param {IList} conf The list configuration
     * @param {List} list The pnp list
     * @param {string} contentTypeID The Content Type ID
     */
    private processContentTypeBinding(conf: IList, list: List, contentTypeID: string): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            list.contentTypes.addAvailableContentType(contentTypeID).then(({ contentType }) => {
                Logger.log({ data: contentType, level: LogLevel.Info, message: `Content Type ${contentTypeID} added successfully to list ${conf.Title}.` });
                resolve();
            }, reject);
        });
    }


    /**
     * Processes fields for a list
     *
     * @param {Web} web The web
     * @param {IList} list The pnp list
     */
    private processFields(web: Web, list: IList): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            if (list.Fields) {
                list.Fields.reduce((chain, field) => chain.then(_ => this.processField(web, list, field)), Promise.resolve()).then(resolve, reject);
            } else {
                resolve();
            }
        });
    }

    /**
     * Processes a field for a lit
     *
     * @param {Web} web The web
     * @param {IList} conf The list configuration
     * @param {string} fieldXml Field xml
     */
    private processField(web: Web, conf: IList, fieldXml: string): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            let fieldProps = JSON.parse(xmljs.xml2json(fieldXml)),
                { InternalName, DisplayName } = fieldProps.elements[0].attributes;
            fieldProps.elements[0].attributes.DisplayName = InternalName;
            web.lists.getByTitle(conf.Title).fields.createFieldAsXml(this.replaceFieldXmlTokens(xmljs.json2xml(fieldProps))).then(({ data, field }) => {
                field.update({ Title: DisplayName }).then(() => {
                    Logger.log({ data: data, level: LogLevel.Info, message: `Field '${DisplayName}' added successfully to list ${conf.Title}.` });
                    resolve();
                }, reject);
            });
        });
    }

    /**
   * Processes field refs for a list
   *
   * @param {Web} web The web
   * @param {IList} list The pnp list
   */
    private processFieldRefs(web: Web, list: IList): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            if (list.FieldRefs) {
                list.FieldRefs.reduce((chain, fieldRef) => chain.then(_ => this.processFieldRef(web, list, fieldRef)), Promise.resolve()).then(resolve, reject);
            } else {
                resolve();
            }
        });
    }

    /**
     * Processes a field ref for a list
     *
     * @param {Web} web The web
     * @param {IList} conf The list configuration
     * @param {IListInstanceFieldRef} fieldRef The list field ref
     */
    private processFieldRef(web: Web, conf: IList, fieldRef: IListInstanceFieldRef): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            web.lists.getByTitle(conf.Title).fields.getById(fieldRef.ID).update({ Hidden: fieldRef.Hidden, Required: fieldRef.Required, Title: fieldRef.DisplayName }).then(() => {
                Logger.log({ data: fieldRef, level: LogLevel.Info, message: `Field '${fieldRef.ID}' updated for list ${conf.Title}.` });
                resolve();
            }, reject);
        });
    }

    /**
     * Processes views for a list
     *
     * @param web The web
     * @param conf The view configuration
     */
    private processViews(web: Web, conf: IList): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            if (conf.Views) {
                conf.Views.reduce((chain, view) => chain.then(_ => this.processView(web, conf, view)), Promise.resolve()).then(resolve, reject);
            } else {
                resolve();
            }
        });
    }

    /**
     * Processes a view for a list
     *
     * @param {Web} web The web
     * @param {IList} conf The list configuration
     * @param {IListView} view The view configuration
     */
    private processView(web: Web, conf: IList, view: IListView): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let _view = web.lists.getByTitle(conf.Title).views.getByTitle(view.Title);
            _view.get().then(_ => {
                _view.update(view.AdditionalSettings).then(() => {
                    this.processViewFields(_view, view.ViewFields).then(resolve, reject);
                });
            }, () => {
                web.lists.getByTitle(conf.Title).views.add(view.Title, view.PersonalView, view.AdditionalSettings).then(result => {
                    Logger.log({ data: result.data, level: LogLevel.Info, message: `View ${view.Title} added successfully to list ${conf.Title}.` });
                    this.processViewFields(result.view, view.ViewFields).then(resolve, reject);
                }, reject);
            });
        });
    }

    /**
     * Processes view fields for a view
     *
     * @param {any} view The pnp view
     * @param {Array<string>} viewFields Array of view fields
     */
    private processViewFields(view: any, viewFields: string[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            view.fields.removeAll().then(() => {
                viewFields.reduce((chain, viewField) => chain.then(_ => view.fields.add(viewField)), Promise.resolve()).then(resolve, reject);
            }, reject);
        });
    }

    /**
     * Replaces tokens in field xml
     *
     * @param {string} fieldXml The field xml
     */
    private replaceFieldXmlTokens(fieldXml: string) {
        let m;
        while ((m = this.tokenRegex.exec(fieldXml)) !== null) {
            if (m.index === this.tokenRegex.lastIndex) {
                this.tokenRegex.lastIndex++;
            }
            m.forEach((match) => {
                let [Type, Value] = match.replace(/[\{\}]/g, "").split(":");
                switch (Type) {
                    case "listid": {
                        let list = this.lists.filter(l => l.Title === Value);
                        if (list.length === 1) {
                            fieldXml = fieldXml.replace(match, list[0].Id);
                        }
                    }
                }
            });
        }
        return fieldXml;
    }
}
