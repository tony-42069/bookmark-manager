"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Tag, Folder, Calendar, Globe, Star, Moon, Sun, Plus } from 'lucide-react';
import _ from 'lodash';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  dateAdded: Date;
  folder: string;
  tags: string[];
  category: string;
}

// AI tools categorization patterns
const categoryPatterns = {
  'AI Image Generation': [
    'midjourney', 'dall-e', 'stable diffusion', 'image generation', 
    'dream studio', 'leonardo.ai'
  ],
  'AI Writing': [
    'chat.openai', 'claude', 'writing', 'content generation', 'copy', 
    'bard.google', 'writer'
  ],
  'AI Development': [
    'github.com/features/copilot', 'codesage', 'code generation', 
    'development', 'coding'
  ],
  'AI Research': [
    'research', 'papers', 'scholar', 'academic', 'studies', 'elicit.org'
  ],
  'AI Productivity': [
    'automation', 'workflow', 'productivity', 'assistant', 'task'
  ]
};

const BookmarkManager = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const detectCategory = (bookmark: { title: string, url: string }): string => {
    const contentToCheck = (bookmark.title + ' ' + bookmark.url).toLowerCase();
    
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some(pattern => contentToCheck.includes(pattern.toLowerCase()))) {
        return category;
      }
    }
    
    return 'Uncategorized';
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const links = doc.getElementsByTagName('a');
      
      const parsedBookmarks = Array.from(links).map(link => {
        const bookmark = {
          id: Math.random().toString(36).substr(2, 9),
          title: link.textContent || 'Untitled',
          url: link.href,
          dateAdded: new Date(parseInt(link.getAttribute('add_date') || '0') * 1000),
          folder: link.closest('dl')?.previousElementSibling?.textContent || 'Uncategorized',
          tags: [],
          category: ''
        };
        
        bookmark.category = detectCategory(bookmark);
        return bookmark;
      });

      setBookmarks(parsedBookmarks);
      const uniqueCategories = _.uniq(parsedBookmarks.map(b => b.category));
      setCategories(uniqueCategories);
    };
    reader.readAsText(file);
  }, []);

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || bookmark.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto p-4">
        <Card className="mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Star className="w-6 h-6 text-yellow-500" />
              AI Bookmark Manager
            </CardTitle>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? 
                <Sun className="w-5 h-5 text-yellow-500" /> : 
                <Moon className="w-5 h-5 text-slate-400" />
              }
            </button>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-4">
              <Input
                type="file"
                accept=".html"
                onChange={handleFileUpload}
                className="mb-4 dark:bg-slate-800 dark:text-white"
              />
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Categories Sidebar */}
              <div className="space-y-4">
                <Card className="dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 dark:text-white">
                      <Folder className="w-4 h-4" />
                      Categories ({categories.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {categories.map(category => (
                        <li 
                          key={category} 
                          className={`flex items-center gap-2 text-sm cursor-pointer
                            hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400
                            ${selectedCategory === category ? 'text-blue-500 font-medium' : ''}`}
                          onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                        >
                          {category}
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
                    <Card key={bookmark.id} className="hover:shadow-lg transition-all duration-300 dark:bg-slate-800">
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
                              <h3 className="font-medium text-sm line-clamp-2 hover:text-blue-500 dark:text-white">
                                {bookmark.title}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1 dark:text-gray-400">
                                {bookmark.url}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                                  {bookmark.category}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {bookmark.dateAdded.toLocaleDateString()}
                                </span>
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
    </div>
  );
};

export default BookmarkManager;