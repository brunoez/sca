import React, { useState, useRef, DragEvent, ChangeEvent, KeyboardEvent } from 'react';
import { UploadCloud, FileCode, AlertCircle, CheckCircle2, FileUp } from 'lucide-react';
import { parseAndNormalizeSbom } from '../../services/normalizer';
import { useScaStore } from '../../store/useScaStore';
import { useTranslation } from '../../context/LanguageContext';

export interface DropzoneProps {
  onSuccess?: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onSuccess }) => {
  const { setModel } = useScaStore();
  const { t } = useTranslation();

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successFile, setSuccessFile] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFileContent = (content: string, fileName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const normalized = parseAndNormalizeSbom(content, fileName);
      
      if (normalized.summary.totalComponents === 0 && normalized.metadata.componentName === fileName.replace(/\.(json|xml)$/i, '')) {
        // Warning if no components were parsed, but process successfully if valid structure
      }

      setModel(normalized);
      setSuccessFile(fileName);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error parsing SBOM file:', err);
      const errorMessage = err?.message || 'Arquivo SBOM inválido ou corrompido.';
      setError(`Erro ao processar "${fileName}": ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setSuccessFile(null);

    const isJson = file.name.toLowerCase().endsWith('.json');
    const isXml = file.name.toLowerCase().endsWith('.xml');

    if (!isJson && !isXml) {
      setError('Formato não suportado. Por favor envie um arquivo .json ou .xml CycloneDX.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content || !content.trim()) {
        setError(`O arquivo "${file.name}" está vazio.`);
        return;
      }
      processFileContent(content, file.name);
    };

    reader.onerror = () => {
      setError(`Falha ao ler o arquivo "${file.name}".`);
    };

    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        role="button"
        tabIndex={0}
        aria-label="Zona de upload de arquivo CycloneDX SBOM"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none outline-none focus:ring-2 focus:ring-cyan-400/50 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01] shadow-2xl shadow-cyan-500/10'
            : 'border-slate-700 bg-slate-900/80 hover:border-slate-500 hover:bg-slate-900 shadow-xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.xml"
          className="hidden"
          onChange={handleInputChange}
          data-testid="file-input"
        />

        <div className="mb-4 p-4 rounded-full bg-slate-800/80 border border-slate-700/60 text-cyan-400 group-hover:scale-110 transition-transform">
          {isLoading ? (
            <FileUp className="w-10 h-10 animate-bounce text-cyan-400" />
          ) : (
            <UploadCloud className="w-10 h-10 text-cyan-400" />
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-100 mb-2 text-center">
          {t('upload.header')}
        </h3>

        <p className="text-slate-400 text-sm text-center mb-6 max-w-md leading-relaxed">
          {t('upload.dropzoneHint')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 bg-slate-950/60 px-4 py-2 rounded-full border border-slate-800">
          <span className="flex items-center gap-1.5 font-medium text-cyan-400">
            <FileCode className="w-3.5 h-3.5" /> CycloneDX
          </span>
          <span className="text-slate-600">•</span>
          <span>JSON (v1.2-v1.6)</span>
          <span className="text-slate-600">•</span>
          <span>XML (v1.2-v1.6)</span>
        </div>
      </div>

      {error && (
        <div 
          data-testid="dropzone-error"
          className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-sm shadow-lg animate-fadeIn"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-200">Falha no Upload</p>
            <p className="mt-0.5 text-rose-300/90">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs px-2 py-1 rounded bg-rose-900/50 transition-colors"
          >
            Fechar
          </button>
        </div>
      )}

      {successFile && !error && (
        <div 
          data-testid="dropzone-success"
          className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-sm shadow-lg animate-fadeIn"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="font-medium">
            Arquivo <span className="font-bold underline">{successFile}</span> carregado com sucesso!
          </p>
        </div>
      )}
    </div>
  );
};
