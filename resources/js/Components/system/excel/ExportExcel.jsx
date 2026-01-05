import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';
import BareButton from '@/Components/common/buttons/BareButton';
import Tooltip from '@/Components/common/Tooltip';

export default function ExportExcel({ data, header, all = false, get, filters, name, currencyColumns }) {
    const [novoObjeto, setNovoObjeto] = useState([]);
  //   const [data, setData] = useState([]);

  //   const getData = (params) => {
  //     try {
  //         axios({
  //             method: "GET",
  //             url: route(get),
  //             params,
  //         }).then((response) => {
  //             setData(response.data);
  //             // console.log('atendimentos: ', response.data);
  //         });
  //     } catch (e) {
  //         console.log(e);
  //     }
  // };

  //     const reload = () => {
  //         getData(filters);
  //     };

  //     useEffect(reload, [filters]);

    const getValueInCascade = (pathArray, source) => {
      let current = source;
      for (let key of pathArray) {
        if (current == null) return '';
        current = current[key];
      }
      if (Array.isArray(current)) {
        return current
          .map(item => item?.name ?? '')
          .filter(n => n)
          .join(', ');
      }
      return current ?? '';
    };

    const controleData = (data) => {
      return data.map(row => {
        const mapped = {};
        Object.entries(header).forEach(([path, { name: colName }]) => {
          const pathArray = path.split('.');
          mapped[colName] = getValueInCascade(pathArray, row);
        });
        return mapped;
      });
    };

    const processar = (objeto, prefixoInterno = '', indexMain) => {
        if(objeto !== null) {
            Object.keys(objeto).forEach((key) => {
                if(typeof objeto[key] !== 'object') {
                    novoObjeto[indexMain][prefixoInterno !== '' ? `${prefixoInterno}-${key}` : key] = objeto[key] || '';
                }
                else {
                    processar(objeto[key],prefixoInterno !== '' ? `${prefixoInterno}-${key}` : key, indexMain)
                }
            });
        }
    }

    const allData = (data, prefixo = '', acumulado = {}) => {

        data.map((valueData, index) => {
            novoObjeto[index] = {}
            setNovoObjeto(novoObjeto)

            processar(valueData, prefixo, index);
        });

        return novoObjeto;
    };

  const exportXls = async () => {

    const dataTemp = all ? allData(data) : controleData(data);

    const worksheet = XLSX.utils.json_to_sheet(dataTemp);

    const columnWidths = dataTemp.reduce((acc, row) => {
      Object.keys(row).forEach((key, index) => {
        const cellValue = String(row[key]);
        const colWidth = cellValue.length;
        acc[index] = Math.max(acc[index] || 0, colWidth);
      });
      return acc;
    }, []);

    worksheet['!cols'] = columnWidths.map(width => ({ wch: width + 3 }));

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    worksheet['!autofilter'] = {
      ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } })
    };

    const CurrencyStyle = {
      numFmt: "R$ #,##0.00"
    };

    if (all || !header) {
      // Modo "all" ou sem header definido: mantém comportamento antigo
      for (let r = 1; r <= range.e.r; r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cellAddress = XLSX.utils.encode_cell({ r, c });
          const cell = worksheet[cellAddress];
          if (cell && cell.t === 'n') {
            cell.s = {
              ...(cell.s || {}),
              ...CurrencyStyle,
            };
          }
        }
      }
    } else {
      const headerEntries = Object.entries(header || {});
      const headerNames = headerEntries.map(([, config]) => config?.name ?? '');
      const currencySet = Array.isArray(currencyColumns) && currencyColumns.length > 0
        ? new Set(currencyColumns)
        : null;

      for (let r = 1; r <= range.e.r; r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cellAddress = XLSX.utils.encode_cell({ r, c });
          const cell = worksheet[cellAddress];
          if (!cell || cell.t !== 'n') continue;

          const headerName = headerNames[c - range.s.c] || '';

          if (!currencySet || currencySet.has(headerName)) {
            cell.s = {
              ...(cell.s || {}),
              ...CurrencyStyle,
            };
          }
        }
      }
    }

    const BorderStyle = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    };

    const StrongBorderStyle = {
      top: { style: "medium", color: { rgb: "000000" } },
      bottom: { style: "medium", color: { rgb: "000000" } },
      left: { style: "medium", color: { rgb: "000000" } },
      right: { style: "medium", color: { rgb: "000000" } }
    };

    const headerStyle = {
      fill: {
        patternType: "solid",
        fgColor: { rgb: "1f2b5e" }
      },
      font: {
        color: { rgb: "ffffff" },
        bold: true,
      },
      border: BorderStyle
    };

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = headerStyle;
      }
    }

    const alternatingRowFill = {
      fill: {
        patternType: "solid",
        fgColor: { rgb: "eeece1" }
      }
    };
    for (let r = 1; r <= range.e.r; r++) {
      if (r % 2 === 0) {
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cellAddress = XLSX.utils.encode_cell({ r, c });
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
              ...worksheet[cellAddress].s,
              ...alternatingRowFill
            };
          }
        }
      }
    }
    for (let r = 1; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            border: BorderStyle
          };
        }
      }
    }

    const lastRow = range.e.r;
    const lastCol = range.e.c;
    if (lastRow > 0) {
      // Destaque da última linha (ex.: totais): negrito, borda forte e cor de fundo diferente
      for (let c = range.s.c; c <= lastCol; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r: lastRow, c });
        if (worksheet[cellAddress]) {
          const existingFont = (worksheet[cellAddress].s && worksheet[cellAddress].s.font) || {};
          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            font: { ...existingFont, bold: true, color: { rgb: "000000" } },
            border: StrongBorderStyle,
            fill: {
              patternType: "solid",
              fgColor: { rgb: "FFF2CC" }, // cor diferente para a última linha
            },
          };
        }
      }

      // Destaque da última coluna (ex.: coluna de totais)
      for (let r = 0; r <= lastRow; r++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c: lastCol });
        if (worksheet[cellAddress]) {
          const existingFont = (worksheet[cellAddress].s && worksheet[cellAddress].s.font) || {};
          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            font: { ...existingFont, bold: true, color: { rgb: "000000" } },
            border: StrongBorderStyle,
          };
        }
      }

      // Primeira coluna (itens): negrito em toda a coluna
      const firstCol = range.s.c;
      for (let r = 0; r <= lastRow; r++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c: firstCol });
        if (worksheet[cellAddress]) {
          const existingFont = (worksheet[cellAddress].s && worksheet[cellAddress].s.font) || {};
          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            font: { ...existingFont, bold: true },
          };
        }
      }
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const date = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      .replace(/\//g, '-').replace(/,/g, '').replace(/:/g, '-');
    saveAs(blob, `${name}_${date}.xlsx`);

  };

  return (
    <Tooltip label="Exportar tabela para Excel">
      <BareButton className={`btn-primary`} onClick={() => exportXls().then(setNovoObjeto([]))}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2m2.354 6.854-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5a.5.5 0 0 1 1 0v3.793l1.146-1.147a.5.5 0 0 1 .708.708"/>
          </svg>
      </BareButton>
    </Tooltip>
  );
}
