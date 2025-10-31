import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { DataLineageGraph } from "@/components/DataLineageGraph";
import { Database } from "lucide-react";

const Index = () => {
  const [lineageData, setLineageData] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-elegant)]">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Data Lineage Visualizer</h1>
              <p className="text-muted-foreground">Upload and explore your data relationships</p>
            </div>
          </div>
        </header>

        <main>
          {!lineageData ? (
            <div className="max-w-2xl mx-auto mt-16">
              <FileUpload onFileLoad={setLineageData} />
              <div className="mt-8 p-6 bg-card rounded-lg shadow-[var(--shadow-card)] border border-border">
                <h3 className="font-semibold text-foreground mb-3">Expected JSON Format:</h3>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto text-muted-foreground">
{`{
  "nodes": [
    {
      "id": "dataset1",
      "label": "Dataset Name",
      "description": "Dataset description",
      "type": "source",
      ...additional properties
    }
  ],
  "edges": [
    {
      "source": "dataset1",
      "target": "dataset2",
      "label": "transforms to"
    }
  ]
}`}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Interactive Lineage Graph
                  </h2>
                  <p className="text-muted-foreground">
                    Click on nodes to view detailed information
                  </p>
                </div>
                <button
                  onClick={() => setLineageData(null)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-[var(--shadow-elegant)] font-medium"
                >
                  Upload New File
                </button>
              </div>
              <DataLineageGraph data={lineageData} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
