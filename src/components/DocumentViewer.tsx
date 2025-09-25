
import React, { useState, useEffect } from 'react';
import { File, FileImage, Download, Maximize, ZoomIn, ZoomOut, Layers, ExternalLink, FileText, FileSpreadsheet, Presentation, Video, Music, Archive, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { getFileExtension, getPreviewType, formatFileSize } from '@/utils/fileHelpers';
import MindMapViewer from './MindMapViewer';

interface DocumentViewerProps {
  conversationId?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ conversationId }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [document, setDocument] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (conversationId && user) {
      loadDocument();
    } else {
      setDocument(null);
      setFileUrl(null);
    }
  }, [conversationId, user]);

  const loadDocument = async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      console.log('Loading document for conversation:', conversationId);
      
      // Load document linked to this conversation
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('conversation_id', conversationId)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading document:', error);
        throw error;
      }
      
      if (data) {
        console.log('Document found:', data);
        setDocument(data);
        
        // Vérifier que le fichier existe dans le storage avant de générer l'URL signée
        const { data: fileExists, error: checkError } = await supabase
          .storage
          .from('documents')
          .list(data.storage_path.split('/').slice(0, -1).join('/'), {
            search: data.storage_path.split('/').pop()
          });

        if (checkError) {
          console.error('Error checking file existence:', checkError);
          throw new Error('Erreur lors de la vérification du fichier');
        }

        if (!fileExists || fileExists.length === 0) {
          console.error('File not found in storage:', data.storage_path);
          throw new Error('Fichier non trouvé dans le stockage');
        }

        console.log('File exists in storage, generating signed URL');
        
        // Generate signed URL for the document
        const { data: signedUrl, error: signedUrlError } = await supabase
          .storage
          .from('documents')
          .createSignedUrl(data.storage_path, 3600); // Valid for 1 hour
        
        if (signedUrlError) {
          console.error('Error creating signed URL:', signedUrlError);
          throw signedUrlError;
        }
        
        if (signedUrl) {
          console.log('Signed URL created successfully');
          setFileUrl(signedUrl.signedUrl);
        }
      } else {
        console.log('No document found for conversation:', conversationId);
        setDocument(null);
        setFileUrl(null);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("chat.errorLoadingDocument"),
        variant: "destructive",
      });
      setDocument(null);
      setFileUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const increaseZoom = () => {
    if (zoomLevel < 200) {
      setZoomLevel(zoomLevel + 10);
    }
  };

  const decreaseZoom = () => {
    if (zoomLevel > 50) {
      setZoomLevel(zoomLevel - 10);
    }
  };

  const getFileIcon = () => {
    if (!document) return <File size={64} className="text-gray-300" />;
    
    const fileType = document.type?.split('/')[0] || '';
    const fileExtension = getFileExtension(document.name).toLowerCase();
    
    if (fileType === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(fileExtension)) {
      return <FileImage size={64} className="text-blue-500" />;
    } else if (['pdf'].includes(fileExtension)) {
      return <File size={64} className="text-red-500" />;
    } else if (['doc', 'docx', 'txt', 'rtf', 'md'].includes(fileExtension)) {
      return <FileText size={64} className="text-blue-600" />;
    } else if (['xls', 'xlsx', 'csv'].includes(fileExtension)) {
      return <FileSpreadsheet size={64} className="text-green-600" />;
    } else if (['ppt', 'pptx'].includes(fileExtension)) {
      return <Presentation size={64} className="text-orange-600" />;
    } else if (fileType === 'video' || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(fileExtension)) {
      return <Video size={64} className="text-purple-600" />;
    } else if (fileType === 'audio' || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(fileExtension)) {
      return <Music size={64} className="text-pink-600" />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(fileExtension)) {
      return <Archive size={64} className="text-yellow-600" />;
    } else if (['html', 'css', 'js', 'ts', 'jsx', 'tsx', 'php', 'py', 'java', 'cpp', 'c', 'cs'].includes(fileExtension)) {
      return <Code size={64} className="text-green-500" />;
    } else {
      return <File size={64} className="text-gray-500" />;
    }
  };

  const handleDownload = async () => {
    if (!document || !fileUrl) return;
    
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      window.open(fileUrl, '_blank');
    }
  };

  const renderFilePreview = () => {
    if (!document || !fileUrl) {
      return (
        <div className="w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
          <File size={64} className="text-gray-400 mb-4" />
          <p className="text-gray-500">{t("chat.noDocumentPreview")}</p>
        </div>
      );
    }

    const previewType = getPreviewType(document.type || '', document.name);
    const fileExtension = getFileExtension(document.name).toLowerCase();
    
    switch (previewType) {
      case 'image':
        return (
          <div className="w-full h-full p-4 overflow-auto">
            <div className="flex justify-start items-start">
              <img 
                src={fileUrl} 
                alt={document.name} 
                className="max-w-full h-auto object-contain border border-gray-200 rounded shadow-lg"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
                onError={() => {
                  console.error('Error loading image:', fileUrl);
                  toast({
                    title: "Erreur",
                    description: "Impossible de charger l'image",
                    variant: "destructive",
                  });
                }}
              />
            </div>
          </div>
        );

      case 'pdf':
        return (
          <iframe
            src={`${fileUrl}#view=FitH&zoom=${zoomLevel}`}
            title={document.name}
            className="w-full h-full border border-gray-200 rounded shadow-lg"
            onError={() => {
              console.error('Error loading PDF:', fileUrl);
              toast({
                title: "Erreur",
                description: "Impossible de charger le PDF",
                variant: "destructive",
              });
            }}
          />
        );

      case 'video':
        return (
          <div className="w-full h-full p-4 overflow-auto">
            <div className="flex justify-start items-start">
              <video
                src={fileUrl}
                controls
                className="max-w-full h-auto border border-gray-200 rounded shadow-lg"
                onError={() => {
                  console.error('Error loading video:', fileUrl);
                  toast({
                    title: "Erreur",
                    description: "Impossible de charger la vidéo",
                    variant: "destructive",
                  });
                }}
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="w-full h-full bg-white rounded-lg border border-gray-200 p-8 overflow-auto">
            <div className="flex flex-col items-start">
              <Music size={80} className="text-pink-500 mb-6" />
              <p className="text-lg font-semibold text-gray-700 mb-4">{document.name}</p>
              <audio
                src={fileUrl}
                controls
                className="w-full max-w-md"
                onError={() => {
                  console.error('Error loading audio:', fileUrl);
                  toast({
                    title: "Erreur",
                    description: "Impossible de charger le fichier audio",
                    variant: "destructive",
                  });
                }}
              >
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
              <div className="mt-4 text-sm text-gray-500">
                <p>Taille: {formatFileSize(document.size)}</p>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <iframe
            src={fileUrl}
            title={document.name}
            className="w-full h-full border border-gray-200 rounded shadow-lg"
            onError={() => {
              console.error('Error loading text file:', fileUrl);
              toast({
                title: "Erreur",
                description: "Impossible de charger le fichier texte",
                variant: "destructive",
              });
            }}
          />
        );

      case 'office':
        return (
          <div className="w-full h-full bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center p-8">
            {getFileIcon()}
            <p className="text-lg font-semibold text-gray-700 mb-2">{document.name}</p>
            <p className="text-sm text-gray-500 mb-6">
              Type: {document.type || 'Inconnu'} • Taille: {formatFileSize(document.size)}
            </p>
            <div className="flex gap-3">
              <Button 
                variant="default" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleDownload}
              >
                <Download size={16} />
                {t("common.download")}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => window.open(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`, '_blank')}
              >
                <ExternalLink size={16} />
                Aperçu Office
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center p-8">
            {getFileIcon()}
            <p className="text-lg font-semibold text-gray-700 mb-2">{document.name}</p>
            <p className="text-sm text-gray-500 mb-6">
              Type: {document.type || 'Fichier'} • Taille: {formatFileSize(document.size)}
            </p>
            <div className="flex gap-3">
              <Button 
                variant="default" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleDownload}
              >
                <Download size={16} />
                {t("common.download")}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => window.open(fileUrl || '', '_blank')}
              >
                <ExternalLink size={16} />
                Ouvrir
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Aperçu non disponible pour ce type de fichier.<br/>
              Utilisez les boutons ci-dessus pour télécharger ou ouvrir le fichier.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center">
          <File size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Aucun document à afficher</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {React.cloneElement(getFileIcon() as React.ReactElement, { size: 24 })}
          </div>
          <div>
            <h2 className="text-lg font-medium truncate">{document?.name}</h2>
            <p className="text-sm text-gray-500">
              {(document.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleDownload}
            title={t("common.download")}
          >
            <Download size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => window.open(fileUrl || '', '_blank')}
            title={t("common.openExternalWindow")}
          >
            <ExternalLink size={16} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="document" className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 px-4">
          <TabsList className="bg-transparent">
            <TabsTrigger value="document" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 border-brand-600 rounded-none">
              {t("chat.documentView")}
            </TabsTrigger>
            <TabsTrigger value="mindmap" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 border-brand-600 rounded-none">
              {t("chat.mindMap")}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="document" className="flex-1 relative overflow-hidden m-0 p-0">
          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-1 flex space-x-1 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={decreaseZoom}
              title={t("common.zoomOut")}
              disabled={zoomLevel <= 50}
            >
              <ZoomOut size={16} />
            </Button>
            <span className="flex items-center justify-center text-xs font-medium w-12">
              {zoomLevel}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={increaseZoom}
              title={t("common.zoomIn")}
              disabled={zoomLevel >= 200}
            >
              <ZoomIn size={16} />
            </Button>
          </div>

          <div className="w-full h-full overflow-auto">
            {renderFilePreview()}
          </div>
        </TabsContent>

        <TabsContent value="mindmap" className="flex-1 relative m-0 p-0">
          <MindMapViewer 
            documentName={document?.name} 
            conversationId={conversationId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentViewer;
