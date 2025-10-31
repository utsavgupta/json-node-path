import { useCallback } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileLoad: (data: any) => void;
}

export const FileUpload = ({ onFileLoad }: FileUploadProps) => {
  const { toast } = useToast();

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          onFileLoad(json);
          toast({
            title: "File loaded successfully",
            description: `Loaded ${json.nodes?.length || 0} nodes and ${json.edges?.length || 0} edges`,
          });
        } catch (error) {
          toast({
            title: "Error parsing file",
            description: "Please upload a valid JSON file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    },
    [onFileLoad, toast]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/json") {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-all cursor-pointer bg-card shadow-[var(--shadow-card)]"
    >
      <input
        type="file"
        accept=".json"
        onChange={onFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-elegant)]">
          <Upload className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">Upload JSON File</p>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop or click to browse
          </p>
        </div>
      </label>
    </div>
  );
};
