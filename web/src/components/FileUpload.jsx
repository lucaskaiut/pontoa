import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@mdi/react";
import { mdiEye, mdiTrashCan, mdiClose } from "@mdi/js";
import classNames from "classnames";

const FileUpload = ({
  label,
  value,
  selectedFile,
  setSelectedFile,
  onDelete,
  fileRemoved = false,
  onRestore,
}) => {
  const input = useRef(null);
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Garantir que value seja sempre string ou null
  const normalizedValue = (() => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  })();

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const modalContent = showModal ? (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-9999"
      onClick={() => setShowModal(false)}
    >
      <div
        className="relative bg-white p-4 rounded-lg shadow-lg flex flex-col items-center max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-700 hover:text-black"
          onClick={() => setShowModal(false)}
        >
          <Icon path={mdiClose} size={1.5} />
        </button>
        <img
          src={preview || normalizedValue}
          alt="Preview Grande"
          className="max-w-full max-h-[80vh] rounded-lg"
        />
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full">
      <div className="flex items-start space-x-6">
        <div className="shrink-0 flex flex-col items-center group gap-2 cursor-pointer">
          {label && (
            <div className="w-full text-sm font-medium text-gray-700 mb-2">{typeof label === 'string' ? label : String(label || '')}</div>
          )}
          <div className="h-32 w-32 flex items-center justify-center relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
            <div
              className={classNames("z-10 group-hover:flex gap-1", {
                hidden: !fileRemoved,
                flex: fileRemoved,
              })}
            >
              {fileRemoved ? (
                <div
                  className="bg-danger py-1 px-2 rounded-lg text-white block hover:scale-110 transition-all"
                  onClick={onRestore}
                >
                  Restaurar
                </div>
              ) : preview || normalizedValue ? (
                <>
                  <Icon
                    path={mdiEye}
                    size={1.2}
                    className="text-white bg-primary p-1 rounded-md brightness-100 hover:scale-110 transition-all cursor-pointer"
                    onClick={() => setShowModal(true)}
                  />
                  <Icon
                    path={mdiTrashCan}
                    size={1.2}
                    className="text-white bg-danger p-1 rounded-md brightness-100 hover:scale-110 transition-all cursor-pointer"
                    onClick={onDelete}
                  />
                </>
              ) : null}
            </div>
            <img
              onClick={() => input.current.click()}
              className={classNames(
                "absolute inset-0 w-full h-full object-cover rounded-lg group-hover:brightness-50 transition-all",
                {
                  "brightness-50": fileRemoved,
                }
              )}
              src={preview || normalizedValue || "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg"}
              alt="Preview"
            />
          </div>

          {selectedFile && (
            <div className="w-32 text-xs text-gray-500 text-center truncate">
              {selectedFile.name.substring(0, 30)}
            </div>
          )}
        </div>
      </div>
      <label className="block">
        <input
          ref={input}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
      </label>

      {createPortal(modalContent, document.body)}
    </div>
  );
};

export default FileUpload;
