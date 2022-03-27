/**
 * Created by Cooper on 2022/03/27.
 */

export const CONTROLLER_METADATA = '__controller__';
export const NAME_METADATA = '__name__';
export const IDL_METADATA = '__idl__';
export const MIDDLEWARE_METADATA = '__middleware__';
export const PARAM_METADATA = '__param__';
export const CONTROLLER_PREFIX = 'CONTROLLER_PREFIX';
export const PATH_ACTIONS = 'PATH_ACTIONS';
export const RPC_ACTIONS = 'RPC_ACTIONS';

export type Middleware = (context: any, next: () => void) => Promise<any>;
