
import React, { useState } from 'react';
import { Plus, Edit, Trash } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { Button } from '../Button';
import { BlogPost } from '../../types';
import { PostEditorModal } from './modals/PostEditorModal';

export const Blog: React.FC = () => {
  const { content, addBlogPost, updateBlogPost, deleteBlogPost } = useContent();
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blog & Conteúdo</h2>
            <Button onClick={() => { setEditingPost(null); setIsPostModalOpen(true); }} size="sm" leftIcon={<Plus size={16}/>}>Novo Artigo</Button>
        </div>

        {isPostModalOpen && (
            <PostEditorModal 
                post={editingPost} 
                onClose={() => setIsPostModalOpen(false)}
                onSave={(post) => {
                    if (editingPost) updateBlogPost(post.id, post);
                    else addBlogPost(post);
                    setIsPostModalOpen(false);
                }}
            />
        )}

        <div className="grid gap-4">
            {content.blogPosts.map((post) => (
                <div key={post.id} className="flex items-center p-4 bg-white dark:bg-[#151921] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0"><img src={post.image} alt={post.title} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 ml-4 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{post.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1"><span>{post.category}</span>•<span>{post.date}</span></div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setEditingPost(post); setIsPostModalOpen(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400"><Edit size={16}/></button>
                        <button onClick={() => deleteBlogPost(post.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"><Trash size={16}/></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
