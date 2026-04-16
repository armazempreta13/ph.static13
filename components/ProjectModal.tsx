import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ExternalLink, Trophy, Lightbulb, Zap, Target } from 'lucide-react';
import { Project } from '../types';
import { Button } from './Button';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../config';
import { OptimizedImage } from './OptimizedImage';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDemo: (url: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose, onOpenDemo }) => {
  if (!project) return null;

  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    image: project.image,
    creator: {
      '@type': 'Organization',
      name: 'PH.static'
    },
    keywords: project.tags.join(', '),
    url: `${SITE_CONFIG.URL}/#project-${project.id}`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    accessMode: ['visual', 'textual']
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-6">
          <Helmet>
            <title>{`${project.title} | Case Study`}</title>
            <meta name="description" content={project.description} />
            <script type="application/ld+json">
              {JSON.stringify(projectSchema)}
            </script>
          </Helmet>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="relative h-48 sm:h-64 shrink-0">
              <OptimizedImage
                src={project.image}
                alt={project.title}
                priority={true}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-colors z-20"
                aria-label="Fechar Modal"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-6 left-6 sm:left-8 z-20">
                <span className="px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-bold uppercase tracking-wider mb-2 inline-block shadow-lg">
                  {project.category}
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                  {project.title}
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-8 lg:gap-12">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Visao geral</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                      <div className="flex items-center gap-2 mb-2 text-red-700 font-bold text-sm uppercase tracking-wide">
                        <Lightbulb size={18} /> Desafio
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{project.challenge || 'Projeto orientado para reposicionamento digital e melhoria da experiencia.'}</p>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                      <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold text-sm uppercase tracking-wide">
                        <Zap size={18} /> Solucao
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{project.solution || 'Estrutura mais clara, mais leve e mais eficiente para apoiar o objetivo comercial.'}</p>
                    </div>

                    <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                      <div className="flex items-center gap-2 mb-2 text-green-700 font-bold text-sm uppercase tracking-wide">
                        <Trophy size={18} /> Resultado
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{project.result || 'Entrega mais forte em percepcao de marca, usabilidade e performance.'}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                    <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold">
                      <Target size={18} className="text-primary-600" />
                      O que esse case prova
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Nao se trata so de design bonito. O objetivo aqui e mostrar estrutura, clareza de comunicacao e uma entrega que ajuda o negocio a parecer mais profissional e funcionar melhor.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                      Tecnologias
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg border border-gray-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] font-bold text-primary-600 mb-2">Leitura comercial</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Se esse nivel de acabamento e clareza faz sentido para a sua empresa, o proximo passo e alinhar escopo, prazo e investimento.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => onOpenDemo(project.demoUrl)}
                      className="w-full justify-center shadow-xl shadow-primary-600/20"
                      size="lg"
                      rightIcon={project.demoUrl.startsWith('#internal') ? <ArrowRight size={18} /> : <ExternalLink size={18} />}
                    >
                      {project.demoUrl.startsWith('#internal') ? 'Ver demo interativa' : 'Visitar site online'}
                    </Button>
                    <p className="text-center text-xs text-gray-400 mt-3">
                      {project.demoUrl.startsWith('#internal') ? 'Experiencia imersiva dentro do portfolio' : 'Abre em uma nova aba'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
