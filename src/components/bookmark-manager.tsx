"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Tag, Folder, Calendar, Globe, Star, Moon, Sun, Info } from 'lucide-react';
import _ from 'lodash';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  dateAdded: Date;
  folder: string;
  category: string;
  subCategory?: string;
  description: string;
}

const enhancedCategories = {
  'AI Tools': {
    'Language & Writing': {
      patterns: ['chat.openai', 'claude', 'bard.google', 'writing', 'language', 'translation', 'grammar', 'copy', 'text'],
      description: 'AI tools for writing, translation, and language processing'
    },
    'Image & Design': {
      patterns: ['midjourney', 'dall-e', 'stable diffusion', 'leonardo.ai', 'design', 'image', 'photo', 'art', 'generator'],
      description: 'AI tools for image generation and design'
    },
    'Development': {
      patterns: ['github', 'copilot', 'code', 'dev', 'programming', 'stackoverflow', 'repository', 'api'],
      description: 'Development tools and coding resources'
    },
    'Analytics & Data': {
      patterns: ['analytics', 'data', 'metrics', 'dashboard', 'visualization', 'insights', 'statistics'],
      description: 'Data analysis and visualization tools'
    },
    'Business & Productivity': {
      patterns: ['workflow', 'business', 'management', 'crm', 'automation', 'productivity', 'task'],
      description: 'Business tools and productivity applications'
    }
  },
  'Learning & Research': {
    patterns: ['course', 'learn', 'tutorial', 'education', 'training', 'documentation', 'docs', 'wiki', 'guide'],
    description: 'Educational resources and learning materials'
  },
  'News & Media': {
    patterns: ['news', 'article', 'blog', 'medium.com', 'substack', 'newsletter', 'magazine'],
    description: 'News sources and media content'
  },
  'Social & Community': {
    patterns: ['linkedin', 'twitter', 'reddit', 'forum', 'community', 'social', 'discussion'],
    description: 'Social media and community platforms'
  },
  'Tools & Utilities': {
    patterns: ['tool', 'utility', 'converter', 'calculator', 'generator', 'platform', 'service'],
    description: 'General utilities and tools'
  }
};

const BookmarkManager = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const analyzeBookmark = (bookmark: { title: string, url: string }): {
    category: string;
    subCategory?: string;
    description: string;
  } => {
    const content = `${bookmark.title} ${bookmark.url}`.toLowerCase();
    let domain = new URL(bookmark.url).hostname.replace('www.', '');

    // Check AI Tools categories first
    for (const [mainCat, subCats] of Object.entries(enhancedCategories['AI Tools'])) {
      if (typeof subCats === 'object' && 'patterns' in subCats) {
        if (subCats.patterns.some(pattern => content.includes(pattern.toLowerCase()))) {
          return {
            category: 'AI Tools',
            subCategory: mainCat,
            description: subCats.description
          };
        }
      }
    }

    // Check other categories
    for (const [category, info] of Object.entries(enhancedCategories)) {
      if (category !== 'AI Tools' && 'patterns' in info) {
        if (info.patterns.some(pattern => content.includes(pattern.toLowerCase()))) {
          return {
            category,
            description: info.description
          };
        }
      }
    }

    // Smart categorization for uncategorized items
    if (domain.includes('github')) {
      return {
        category: 'Development',
        description: 'Development resource or repository'
      };
    }

    return {
      category: 'Other Resources',
      description: `Resource from ${domain}`
    };
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
        const url = link.href;
        const analysis = analyzeBookmark({ title: link.textContent || '', url });
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          title: link.textContent || 'Untitled',
          url,
          dateAdded: new Date(parseInt(link.getAttribute('add_date') || '0') * 1000),
          folder: link.closest('dl')?.previousElementSibling?.textContent || 'Uncategorized',
          category: analysis.category,
          subCategory: analysis.subCategory,
          description: analysis.description
        };
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
    const matchesSubCategory = !selectedSubCategory || bookmark.subCategory === selectedSubCategory;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  const getCategoryStats = () => {
    return categories.map(category => ({
      name: category,
      count: bookmarks.filter(b => b.category === category).length
    }));
  };

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
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {getCategoryStats().map(({ name, count }) => (
                        <li 
                          key={name} 
                          className={`flex items-center justify-between text-sm cursor-pointer
                            hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400
                            ${selectedCategory === name ? 'text-blue-500 font-medium' : ''}`}
                          onClick={() => setSelectedCategory(name === selectedCategory ? null : name)}
                        >
                          <span>{name}</span>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                            {count}
                          </span>
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
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                                  {bookmark.category}
                                </span>
                                {bookmark.subCategory && (
                                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                                    {bookmark.subCategory}
                                  </span>
                                )}
                                <div className="w-full mt-1">
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    {bookmark.description}
                                  </span>
                                </div>
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