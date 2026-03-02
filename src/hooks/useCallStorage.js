import { useState, useEffect, useCallback } from 'react';
import {
  addCall,
  getAllCalls,
  deleteCall as deleteCallFromDB,
  searchCalls as searchCallsFromDB,
} from '../services/storage';

export default function useCallStorage() {
  const [calls, setCalls] = useState([]);

  const refresh = useCallback(async () => {
    const data = await getAllCalls();
    setCalls(data);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveCall = useCallback(
    async (callData) => {
      const record = await addCall(callData);
      await refresh();
      return record;
    },
    [refresh],
  );

  const removeCall = useCallback(
    async (id) => {
      await deleteCallFromDB(id);
      await refresh();
    },
    [refresh],
  );

  const searchCall = useCallback(async (keyword) => {
    const results = await searchCallsFromDB(keyword);
    return results;
  }, []);

  const exportJSON = useCallback(async () => {
    const data = await getAllCalls();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-summary-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importJSON = useCallback(
    async (file) => {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        throw new Error('올바른 JSON 형식이 아닙니다.');
      }
      for (const item of data) {
        await addCall(item);
      }
      await refresh();
      return data.length;
    },
    [refresh],
  );

  return {
    calls,
    saveCall,
    deleteCall: removeCall,
    searchCalls: searchCall,
    exportJSON,
    importJSON,
    refresh,
  };
}
