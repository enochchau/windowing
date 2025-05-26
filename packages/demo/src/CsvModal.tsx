import React, { useState, useRef } from "react";
import { Modal } from "./components/Modal";
import css from "./CsvModal.module.css";

interface CsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (csvData: string) => void;
  initialValue?: string;
}

export function CsvModal({ isOpen, onClose, onSubmit, initialValue = "" }: CsvModalProps) {
  const [csvData, setCsvData] = useState(initialValue);
  const [inputMethod, setInputMethod] = useState<"paste" | "upload">("paste");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (csvData.trim()) {
      onSubmit(csvData);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = event => {
        const content = event.target?.result as string;
        setCsvData(content);
      };
      reader.readAsText(file);
    } else if (file) {
      alert("Please select a valid CSV file");
    }
  };

  const footer = (
    <>
      <button type="button" onClick={onClose} className={css["cancel-button"]}>
        Cancel
      </button>
      <button
        type="submit"
        form="csvForm"
        className={css["submit-button"]}
        disabled={!csvData.trim()}
      >
        Import CSV
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import CSV Data" footer={footer}>
      <form id="csvForm" onSubmit={handleSubmit}>
        <div className={css["input-method-selector"]}>
          <label>
            <input
              type="radio"
              value="paste"
              checked={inputMethod === "paste"}
              onChange={e => setInputMethod(e.target.value as "paste")}
            />
            Paste CSV text
          </label>
          <label>
            <input
              type="radio"
              value="upload"
              checked={inputMethod === "upload"}
              onChange={e => setInputMethod(e.target.value as "upload")}
            />
            Upload CSV file
          </label>
        </div>

        {inputMethod === "paste" ? (
          <div className={css["text-area-container"]}>
            <label htmlFor="csvTextArea">CSV Data:</label>
            <textarea
              id="csvTextArea"
              className={css["text-area"]}
              value={csvData}
              onChange={e => setCsvData(e.target.value)}
              placeholder="Paste your CSV data here..."
              rows={10}
            />
          </div>
        ) : (
          <div className={css["file-upload-container"]}>
            <label htmlFor="csvFileInput">Select CSV file:</label>
            <input
              id="csvFileInput"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className={css["file-input"]}
            />
            {csvData && (
              <div className={css["preview-container"]}>
                <p>File loaded successfully. Preview:</p>
                <div className={css.preview}>
                  {csvData
                    .split("\n")
                    .slice(0, 5)
                    .map((line, index) => (
                      <div key={index} className={css["preview-line"]}>
                        {line}
                      </div>
                    ))}
                  {csvData.split("\n").length > 5 && <div className={css["preview-line"]}>...</div>}
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
