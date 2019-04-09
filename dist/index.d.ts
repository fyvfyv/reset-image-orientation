/**
 * Orient image and execute callback with base64 param
 *
 * @param {File} file
 * @param {Function} callback — receive a base64 image param
 */
declare const resetOrientation: (file: File, callback: (b64: string) => void) => void;
export default resetOrientation;
