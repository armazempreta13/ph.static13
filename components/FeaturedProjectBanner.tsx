import React, { useState } from 'react';
import { ArrowUpRight, ExternalLink, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContent } from '../contexts/ContentContext';
import { ProjectModal } from './ProjectModal';

export const FeaturedProjectBanner: React.FC = () => {
  const { content } = useContent();
  const project = content.projects[content.projects.length - 1] || content.projects.find((p) => p.featured) || content.projects[0];
  const [selectedProject, setSelectedProject] = useState<typeof project | null>(null);

  if (!project) return null;

  const handleOpenDemo = (url: string) => {
    if (url.startsWith('#internal:')) {
        // Handle internal routes if needed
    } else {
        window.open(url, '_blank');
    }
  };

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-purple-200/20 rounded-full blur-3xl dark:from-indigo-500/10 dark:to-purple-500/5" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-indigo-100/20 to-transparent rounded-full blur-3xl dark:from-indigo-900/10" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 items-start mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 px-4 py-2 border border-indigo-200/50 dark:border-indigo-700/30">
            <Sparkles size={16} className="text-indigo-600 dark:text-indigo-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-200">
              Projeto em Destaque
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Último Projeto<br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Concluído
            </span>
          </h2>
        </motion.div>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="rounded-3xl border border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl dark:shadow-2xl dark:shadow-black/40"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            
            {/* Image Section - Takes 3 columns */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
              className="relative h-72 lg:h-full lg:col-span-3 overflow-hidden group bg-black flex items-center justify-center"
            >
              {/* Black Background */}
              <div className="absolute inset-0 bg-black" />
              
              {/* Logo */}
              <img
                src="https://i.imgur.com/Ga4bMmk.png"
                alt={project.title}
                className="relative z-10 h-64 w-auto object-contain transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-5" />
              
              {/* Quick Link Button on Image */}
              <motion.a
                href={project.liveUrl || project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-6 bottom-6 inline-flex items-center gap-2 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 z-20"
              >
                <ExternalLink size={16} />
                Ver Site ao Vivo
              </motion.a>
            </motion.div>

            {/* Content Section - Takes 2 columns */}
            <div className="lg:col-span-2 p-8 sm:p-12 flex flex-col justify-between">
              
              {/* Tags */}
              <div>
                <div className="mb-6 flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag) => (
                    <motion.span 
                      key={tag}
                      whileHover={{ scale: 1.05 }}
                      className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-200/50 dark:border-indigo-700/30 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-all"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 leading-tight">
                  {project.title}
                </h3>

                {/* Category */}
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-6">
                  {project.category}
                </p>

                {/* Description */}
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-8 line-clamp-3">
                  {project.description}
                </p>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4 mb-8 pb-8 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Performance</span>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/20">
                      <Zap size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">98/100</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-50/50 dark:bg-cyan-900/20">
                      <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">&lt;1s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={() => setSelectedProject(project)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Detalhes
                  <ArrowUpRight size={18} />
                </motion.button>

                <motion.a
                  href={project.liveUrl || project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-200/50 dark:border-indigo-700/50 bg-white/50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 transition-all duration-300"
                >
                  Acessar
                  <ExternalLink size={18} />
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Project Modal */}
      <ProjectModal 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
        onOpenDemo={handleOpenDemo}
      />
    </section>
  );
};
