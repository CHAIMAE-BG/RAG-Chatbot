
/**
 * Vérifier si le type de fichier est pris en charge - Maintenant accepte TOUS les fichiers
 * @param fileType - MIME type du fichier
 * @returns boolean - Retourne toujours true maintenant
 */
export const isSupportedFileType = (fileType: string): boolean => {
  // Accepter tous les types de fichiers
  return true;
};

/**
 * Formater la taille du fichier pour l'affichage
 * @param bytes - Taille en octets
 * @param decimals - Nombre de décimales
 * @returns string
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Obtenir l'extension d'un fichier à partir de son nom
 * @param filename - Nom du fichier
 * @returns string
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Obtenir un icône en fonction de l'extension du fichier
 * @param extension - Extension du fichier
 * @returns string
 */
export const getFileTypeIcon = (extension: string): string => {
  const ext = extension.toLowerCase();
  
  if (['pdf'].includes(ext)) {
    return 'pdf';
  } else if (['doc', 'docx', 'txt', 'rtf', 'md'].includes(ext)) {
    return 'document';
  } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return 'spreadsheet';
  } else if (['ppt', 'pptx'].includes(ext)) {
    return 'presentation';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'tiff'].includes(ext)) {
    return 'image';
  } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext)) {
    return 'video';
  } else if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) {
    return 'audio';
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'archive';
  } else if (['html', 'css', 'js', 'ts', 'jsx', 'tsx', 'php', 'py', 'java', 'cpp', 'c', 'cs'].includes(ext)) {
    return 'code';
  } else {
    return 'file';
  }
};

/**
 * Déterminer le type de contenu pour la prévisualisation
 * @param fileType - MIME type du fichier
 * @param fileName - Nom du fichier
 * @returns string
 */
export const getPreviewType = (fileType: string, fileName: string): string => {
  const extension = getFileExtension(fileName).toLowerCase();
  
  if (fileType.startsWith('image/')) {
    return 'image';
  } else if (fileType === 'application/pdf') {
    return 'pdf';
  } else if (fileType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
    return 'video';
  } else if (fileType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(extension)) {
    return 'audio';
  } else if (fileType.startsWith('text/') || ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'md'].includes(extension)) {
    return 'text';
  } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
    return 'office';
  } else {
    return 'download';
  }
};
