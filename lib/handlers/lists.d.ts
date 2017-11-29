import { HandlerBase } from "./handlerbase";
import { IList } from "../schema";
import { Web } from "sp-pnp-js";
/**
 * Describes the Lists Object Handler
 */
export declare class Lists extends HandlerBase {
    private lists;
    private tokenRegex;
    /**
     * Creates a new instance of the Lists class
     */
    constructor();
    /**
     * Provisioning lists
     *
     * @param {Web} web The web
     * @param {Array<IList>} lists The lists to provision
     */
    ProvisionObjects(web: Web, lists: IList[]): Promise<void>;
    /**
     * Processes a list
     *
     * @param {Web} web The web
     * @param {IList} list The list
     */
    private processList(web, conf);
    /**
     * Processes content type bindings for a list
     *
     * @param {IList} conf The list configuration
     * @param {List} list The pnp list
     * @param {Array<IContentTypeBinding>} contentTypeBindings Content type bindings
     * @param {boolean} removeExisting Remove existing content type bindings
     */
    private processContentTypeBindings(conf, list, contentTypeBindings, removeExisting);
    /**
     * Processes a content type binding for a list
     *
     * @param {IList} conf The list configuration
     * @param {List} list The pnp list
     * @param {string} contentTypeID The Content Type ID
     */
    private processContentTypeBinding(conf, list, contentTypeID);
    /**
     * Processes fields for a list
     *
     * @param {Web} web The web
     * @param {IList} list The pnp list
     */
    private processFields(web, list);
    /**
     * Processes a field for a lit
     *
     * @param {Web} web The web
     * @param {IList} conf The list configuration
     * @param {string} fieldXml Field xml
     */
    private processField(web, conf, fieldXml);
    /**
   * Processes field refs for a list
   *
   * @param {Web} web The web
   * @param {IList} list The pnp list
   */
    private processFieldRefs(web, list);
    /**
     * Processes a field ref for a list
     *
     * @param {Web} web The web
     * @param {IList} conf The list configuration
     * @param {IListInstanceFieldRef} fieldRef The list field ref
     */
    private processFieldRef(web, conf, fieldRef);
    /**
     * Processes views for a list
     *
     * @param web The web
     * @param conf The view configuration
     */
    private processViews(web, conf);
    /**
     * Processes a view for a list
     *
     * @param {Web} web The web
     * @param {IList} conf The list configuration
     * @param {IListView} view The view configuration
     */
    private processView(web, conf, view);
    /**
     * Processes view fields for a view
     *
     * @param {any} view The pnp view
     * @param {Array<string>} viewFields Array of view fields
     */
    private processViewFields(view, viewFields);
    /**
     * Replaces tokens in field xml
     *
     * @param {string} fieldXml The field xml
     */
    private replaceFieldXmlTokens(fieldXml);
}
