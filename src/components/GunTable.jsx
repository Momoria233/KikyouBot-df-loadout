import React, { useEffect, useState } from "react";
import Papa from "papaparse";

export default function GunTable({ csvUrl = "loadout_251015new.csv" }) {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mergeMap, setMergeMap] = useState([]);
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    Papa.parse(`${import.meta.env.BASE_URL}${csvUrl}?v=${Date.now()}`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        // 排序：类型含“慎用”的排最后
        const sortedRows = [...result.data].sort((a, b) => {
          const aCaution = a["类型"] && a["类型"].includes("慎用");
          const bCaution = b["类型"] && b["类型"].includes("慎用");
          if (aCaution === bCaution) return 0;
          return aCaution ? 1 : -1;
        });
        setRows(sortedRows);
        setColumns(result.meta.fields);
      },
      error: (err) => console.error("CSV 解析失败:", err),
    });
  }, [csvUrl]);

  useEffect(() => {
    const map = rows.map(() => ({}));
    columns.forEach((col) => {
      let i = 0;
      while (i < rows.length) {
        if (col === "图片" || !rows[i][col] || !rows[i][col].startsWith("MERGE:")) {
          i++;
          continue;
        }
        let rowSpan = 1;
        for (
          let j = i + 1;
          j < rows.length &&
          rows[j]["枪械名称"] === rows[i]["枪械名称"] &&
          (!rows[j][col] || rows[j][col] === "");
          j++
        ) {
          rowSpan++;
        }
        for (let k = 1; k < rowSpan; k++) {
          map[i + k][col] = true;
        }
        i += rowSpan;
      }
    });
    setMergeMap(map);
  }, [rows, columns]);

  // esc 关闭预览
  useEffect(() => {
    if (!previewImg) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setPreviewImg(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewImg]);

  return (
    <div className="overflow-x-auto border rounded-lg bg-black shadow">
      {rows.length === 0 ? (
        <div className="p-4 text-center text-gray-500">暂无数据</div>
      ) : (
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-800 text-white">
            <tr>
              {columns.map((col) => (
                <th key={col} className="p-2 border border-gray-600 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              // 判断是否是“慎用”类型的第一行
              const isCaution = row["类型"] && row["类型"].includes("慎用");
              const prevIsCaution = i > 0 && rows[i - 1]["类型"] && rows[i - 1]["类型"].includes("慎用");
              const showDivider = isCaution && (!prevIsCaution);

              return (
                <React.Fragment key={i}>
                  {showDivider && (
                    <tr>
                      <td colSpan={columns.length} className="bg-red-100 text-red-700 font-bold text-center py-2 border-y border-red-300">
                        —— 以下为慎用方案 ——
                      </td>
                    </tr>
                  )}
                  <tr className={i % 2 === 0 ? "bg-gray-100" : "bg-gray-50"}>
                    {columns.map((col) => {
                      // 合并“枪械名称”列
                      if (col === "枪械名称") {
                        // 判断是否是该枪械的第一行
                        const showName =
                          i === 0 || row["枪械名称"] !== rows[i - 1]["枪械名称"];
                        if (showName) {
                          // 计算 rowSpan
                          let rowSpan = 1;
                          for (
                            let j = i + 1;
                            j < rows.length && rows[j]["枪械名称"] === row["枪械名称"];
                            j++
                          ) {
                            rowSpan++;
                          }
                          return (
                            <td
                              key={col}
                              rowSpan={rowSpan}
                              className="p-2 border border-gray-300 align-middle font-bold bg-gray-200"
                            >
                              {row[col]}
                            </td>
                          );
                        } else {
                          // 后续行跳过该单元格
                          return null;
                        }
                      }
                      if (mergeMap[i] && mergeMap[i][col]) return null;
                      if (col === "图片" && row[col]) {
                        return (
                          <td key={col} className="p-2 border border-gray-300">
                            <div
                              className="relative w-10 h-10 cursor-pointer"
                              onClick={() => setPreviewImg(row[col])}
                            >
                              <img
                                src={
                                  row[col].startsWith("http")
                                    ? row[col]
                                    : `${import.meta.env.BASE_URL}${row[col]}`
                                }
                                alt="预览"
                                className="object-cover w-10 h-10 rounded border border-gray-400"
                              />
                            </div>
                          </td>
                        );
                      }
                      if (row[col] && row[col].startsWith("MERGE:")) {
                        let rowSpan = 1;
                        for (
                          let j = i + 1;
                          j < rows.length &&
                          rows[j]["枪械名称"] === row["枪械名称"] &&
                          (!rows[j][col] || rows[j][col] === "");
                          j++
                        ) {
                          rowSpan++;
                        }
                        return (
                          <td
                            key={col}
                            rowSpan={rowSpan}
                            className="p-2 border border-gray-300 whitespace-pre-line bg-gray-50"
                          >
                            {row[col]
                              .replace(/^MERGE:/, "")
                              .replace(/\\n/g, "\n")
                              .replace(/\n/g, "\n")}
                          </td>
                        );
                      }
                      return (
                        <td key={col} className="p-2 border border-gray-300 whitespace-pre-line">
                          {(row[col] || "—").replace(/\\n/g, "\n").replace(/\n/g, "\n")}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
      {/* 图片预览弹窗 */}
      {previewImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={
              previewImg.startsWith("http")
                ? previewImg
                : `${import.meta.env.BASE_URL}${previewImg}`
            }
            alt="大图"
            className="w-auto max-w-[80vw] max-h-[80vh] rounded shadow-lg border-2 border-indigo-400 bg-white"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
