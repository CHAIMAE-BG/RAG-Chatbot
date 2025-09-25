
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MindMapViewerProps {
  documentName?: string;
  conversationId?: string;
}

const API_BASE_URL = 'http://localhost:8000';

const getMindmapUrl = (filename: string): string => {
  return `${API_BASE_URL}/mindmaps/${filename}/mindmap.html`;
};

const checkMindmapExists = async (filename: string): Promise<boolean> => {
  try {
    const url = getMindmapUrl(filename);
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'cors'
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking mindmap existence:', error);
    return false;
  }
};

const waitForMindmap = async (filename: string, maxAttempts: number = 60, delay: number = 3000): Promise<boolean> => {
  console.log(`Waiting for mindmap generation for: ${filename}`);
  
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Attempt ${i + 1}/${maxAttempts} to check mindmap for ${filename}`);
    
    const exists = await checkMindmapExists(filename);
    if (exists) {
      console.log(`Mindmap found for ${filename} after ${i + 1} attempts`);
      return true;
    }
    
    if (i < maxAttempts - 1) {
      console.log(`Mindmap not ready, waiting ${delay}ms before next check...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log(`Mindmap generation timeout for ${filename} after ${maxAttempts} attempts`);
  return false;
};

const MindMapViewer: React.FC<MindMapViewerProps> = ({ documentName, conversationId }) => {
  const [mindmapUrl, setMindmapUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (documentName) {
      loadMindMap();
    } else {
      setMindmapUrl(null);
      setError(null);
    }
  }, [documentName]);

  const loadMindMap = async () => {
    if (!documentName) {
      setError('Aucun document disponible');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Checking mindmap for document:', documentName);
      
      // D'abord vérifier si la mindmap existe déjà
      const exists = await checkMindmapExists(documentName);
      console.log('Mindmap exists:', exists);
      
      if (exists) {
        const url = getMindmapUrl(documentName);
        console.log('Setting mindmap URL:', url);
        setMindmapUrl(url);
        toast({
          title: "Mindmap chargée",
          description: "La mindmap a été chargée avec succès",
        });
      } else {
        // Attendre que la mindmap soit générée par le backend
        console.log('Waiting for mindmap generation...');
        toast({
          title: "Génération en cours",
          description: "La mindmap est en cours de génération, veuillez patienter...",
        });
        
        const generated = await waitForMindmap(documentName);
        console.log('Mindmap generated:', generated);
        
        if (generated) {
          const url = getMindmapUrl(documentName);
          console.log('Setting mindmap URL after generation:', url);
          setMindmapUrl(url);
          toast({
            title: "Mindmap générée",
            description: "La mindmap a été créée avec succès",
          });
        } else {
          setError('La mindmap n\'a pas pu être générée. Veuillez réessayer ou vérifier que le backend est accessible.');
          toast({
            title: "Erreur de génération",
            description: "La mindmap n'a pas pu être générée dans les temps impartis",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error('Error loading mindmap:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur lors du chargement de la mindmap: ${errorMessage}`);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement de la mindmap",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('Manual refresh requested for:', documentName);
    loadMindMap();
  };

  const handleDownload = () => {
    if (mindmapUrl) {
      window.open(mindmapUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin h-8 w-8 text-blue-500 mb-4" />
          <p className="text-gray-500">Génération de la mindmap en cours...</p>
          <p className="text-sm text-gray-400 mt-2">Cela peut prendre quelques instants</p>
          <p className="text-xs text-gray-400 mt-1">Document: {documentName}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4 text-sm">{error}</p>
          <p className="text-xs text-gray-400 mb-4">Document: {documentName}</p>
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!mindmapUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 mb-2">Aucune mindmap disponible</p>
          <p className="text-xs text-gray-400 mb-4">Document: {documentName || 'Aucun'}</p>
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Générer la mindmap
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Barre d'outils */}
      <div className="flex-shrink-0 p-2 border-b border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-600">Mindmap: {documentName}</span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw size={14} />
            Actualiser
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-1"
          >
            <ExternalLink size={14} />
            Ouvrir
          </Button>
        </div>
      </div>

      {/* Iframe pour afficher la mindmap */}
      <div className="flex-1 relative">
        <iframe
          src={mindmapUrl}
          title={`Mindmap - ${documentName}`}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          onLoad={() => {
            console.log('Mindmap iframe loaded successfully');
          }}
          onError={(e) => {
            console.error('Error loading mindmap iframe:', e);
            setError('Erreur lors du chargement de la mindmap dans l\'iframe');
            setMindmapUrl(null);
          }}
        />
      </div>
    </div>
  );
};

export default MindMapViewer;
