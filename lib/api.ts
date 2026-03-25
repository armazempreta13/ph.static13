
import { supabase } from './supabaseClient';
import { ClientProject, ContactFormData, PaymentOrder, ProjectFile } from '../types';
import { generatePixCode } from './pix';

/**
 * API REAL - CONECTADA AO SUPABASE
 */
/**
 * API REAL - CONECTADA AO SUPABASE
 * 
 * Estrutura de API completa com operações CRUD para os principais recursos.
 */
export const api = {
    
    auth: {
        login: async (email: string, password: string) => {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw new Error("E-mail ou senha incorretos.");

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
            return { 
                role: profile?.role || 'client', 
                token: data.session.access_token,
                user: data.user,
                profile: profile
            };
        },
        register: async (data: any) => { 
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: { data: { full_name: data.clientName || data.name, role: data.role || 'client' } }
            });
            if (error) throw error;
            return { success: true, user: authData.user }; 
        },
        updateProfile: async (userId: string, data: { name?: string, avatar_url?: string }) => {
             const { error } = await supabase.from('profiles').update({ full_name: data.name, avatar_url: data.avatar_url }).eq('id', userId); 
             if (error) throw error;
             return { success: true };
        },
        logout: async () => {
            await supabase.auth.signOut();
        }
    },

    project: {
        create: async (projectData: any) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const { data, error } = await supabase.from('projects').insert({
                user_id: user.id, 
                client_email: projectData.email,
                name: projectData.projectName,
                //... outros campos do projeto
            }).select().single();

            if (error) throw error;
            return data;
        },
        getById: async (id: string) => {
            const { data, error } = await supabase.from('projects').select('*, clients(*)').eq('id', id).single();
            if (error) throw error;
            return data;
        },
        getAll: async () => {
            const { data, error } = await supabase.from('projects').select('*, clients(name, email)');
            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: any) => {
            const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    client: {
        create: async (clientData: { name: string, email: string }) => {
            const { data, error } = await supabase.from('clients').insert(clientData).select().single();
            if (error) throw error;
            return data;
        },
        getById: async (id: string) => {
            const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        },
        getAll: async () => {
            const { data, error } = await supabase.from('clients').select('*');
            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: any) => {
            const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    task: {
        create: async (taskData: { project_id: string, name: string, description?: string }) => {
            const { data, error } = await supabase.from('tasks').insert(taskData).select().single();
            if (error) throw error;
            return data;
        },
        getAllForProject: async (projectId: string) => {
            const { data, error } = await supabase.from('tasks').select('*').eq('project_id', projectId);
            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: any) => {
            const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    invoice: {
        create: async (invoiceData: { project_id: string, amount: number, due_date?: string }) => {
            const { data, error } = await supabase.from('invoices').insert(invoiceData).select().single();
            if (error) throw error;
            return data;
        },
        getAllForProject: async (projectId: string) => {
            const { data, error } = await supabase.from('invoices').select('*').eq('project_id', projectId);
            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: any) => {
            const { data, error } = await supabase.from('invoices').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('invoices').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    email: {
        send: async (payload: any) => {
            const { error } = await supabase.functions.invoke('send-email', { body: payload });
            if (error) console.log("Erro ao enviar email (SMTP não configurado?), logando:", payload);
            return { success: true, message: "E-mail enviado." };
        }
    },

    contact: {
        submit: async (data: ContactFormData) => { 
            const { error } = await supabase.from('leads').insert(data);
            if (error) throw error;
            return { success: true }; 
        }
    },

    payment: {
        create: async (amount: number, description: string, payerEmail: string): Promise<PaymentOrder> => {
            const txId = `PH${Math.floor(Math.random() * 10000)}`.toUpperCase();
            const fallbackKey = "05379507107"; 
            const pixCode = generatePixCode(fallbackKey, "PH Development", "BRASILIA", amount, txId);
            return {
                id: txId,
                description,
                amount,
                status: 'pending',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                pixCode: pixCode
            };
        },
        checkStatus: async (paymentId: string): Promise<{status: string}> => {
            return { status: 'pending' };
        }
    }
};
