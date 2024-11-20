"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Tag, Folder, Calendar, Globe, Star } from 'lucide-react';
import _ from 'lodash';

// Define interfaces for our data structures
interface Bookmark {
  id: string;
  title: string;
  url: string;
  dateAdded: Date;
  folder: string;
}

const BookmarkManager = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const links = doc.getElementsByTagName('a');
      
      const parsedBookmarks = Array.from(links).map(link => ({
        id: Math.random().toString(36).substr(2, 9),
        title: link.textContent || 'Untitled',
        url: link.href,
        dateAdded: new Date(parseInt(link.getAttribute('add_date') || '0') * 1000),
        folder: link.closest('dl')?.previousElementSibling?.textContent || 'Uncategorized'
      }));

      setBookmarks(parsedBookmarks);
    };
    reader.readAsText(file);
  }, []);

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = !selectedFolder || bookmark.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const folders = _.uniq(bookmarks.map(b => b.folder)).filter(Boolean);

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Bookmark Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              type="file"
              accept=".html"
              onChange={handleFileUpload}
              className="mb-4"
            />
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search bookmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    Folders ({folders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {folders.map(folder => (
                      <li 
                        key={folder} 
                        className={`flex items-center gap-2 text-sm cursor-pointer hover:text-blue-500 ${
                          selectedFolder === folder ? 'text-blue-500 font-medium' : ''
                        }`}
                        onClick={() => setSelectedFolder(folder === selectedFolder ? null : folder)}
                      >
                        {folder}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookmarks.map(bookmark => (
                  <Card key={bookmark.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <a 
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 flex-shrink-0">
                            <Globe className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm line-clamp-2 hover:text-blue-500">
                              {bookmark.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {bookmark.url}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {bookmark.dateAdded.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookmarkManager;