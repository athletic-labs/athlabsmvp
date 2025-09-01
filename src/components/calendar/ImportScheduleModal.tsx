'use client';

import { useState } from 'react';
import { X, Upload, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ImportScheduleModalProps {
  onClose: () => void;
  onImport: (games: any[]) => void;
}

export default function ImportScheduleModal({ onClose, onImport }: ImportScheduleModalProps) {
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!importText.trim()) {
      toast.error('Please enter schedule data to import');
      return;
    }

    setImporting(true);
    
    try {
      // Parse different formats of schedule data
      const lines = importText.trim().split('\n');
      const games = [];
      
      for (const line of lines) {
        // Support multiple formats:
        // "3/15/2024 7:00 PM vs State University - Home"
        // "March 15, 2024 @ 7:00 PM @ Tech College"
        
        const gameMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\w+ \d{1,2}, \d{4})\s+@?\s*(\d{1,2}:\d{2}\s*[AP]M)\s+(vs|@)\s+(.+?)(\s+-\s+(Home|Away))?$/i);
        
        if (gameMatch) {
          const [, dateStr, time, homeAway, opponent, , location] = gameMatch;
          const isHome = homeAway.toLowerCase() === 'vs' || location?.toLowerCase() === 'home';
          
          // Parse date
          let gameDate;
          if (dateStr.includes('/')) {
            const [month, day, year] = dateStr.split('/');
            gameDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            gameDate = new Date(dateStr).toISOString().split('T')[0];
          }
          
          games.push({
            id: `game-${Date.now()}-${games.length}`,
            date: gameDate,
            opponent: opponent.trim(),
            time: time,
            location: location || (isHome ? 'Home' : 'Away'),
            isHome,
            meals: []
          });
        }
      }
      
      if (games.length === 0) {
        toast.error('No valid games found in the schedule data');
        return;
      }
      
      onImport(games);
      toast.success(`Imported ${games.length} games successfully`);
      onClose();
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import schedule');
    } finally {
      setImporting(false);
    }
  };

  const sampleFormat = `3/15/2024 7:00 PM vs State University - Home
3/22/2024 2:00 PM @ Tech College - Away
3/29/2024 6:00 PM vs City University - Home`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Import Game Schedule</h2>
            <p className="text-sm text-gray-600">
              Import your team's game schedule from text format
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Format Example */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Expected Format:</span>
            </div>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
{sampleFormat}
            </pre>
          </div>

          {/* Import Textarea */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Paste Schedule Data:
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your game schedule here..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-electric-blue"
            />
          </div>

          {/* Format Tips */}
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Supported formats:</strong></p>
            <p>• MM/DD/YYYY HH:MM AM/PM vs/@ Opponent - Home/Away</p>
            <p>• March DD, YYYY @ HH:MM AM/PM @ Opponent</p>
            <p><strong>Tips:</strong> Use "vs" for home games, "@" for away games</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importing || !importText.trim()}
            className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {importing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}