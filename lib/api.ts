import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ContactFormData, PaymentOrder } from '../types';
import { generatePixCode } from './pix';
import { firebaseAuthService } from './firebaseAuth';
import { getFirebaseAuth, getFirestoreDb, isFirebaseConfigured } from './firebase';
import { sendTransactionalEmail, submitContactForm } from './contactService';

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const user = await firebaseAuthService.loginWithEmail(email, password);
      const token = await user.getIdToken();

      return {
        role: user.email?.includes('admin') ? 'admin' : 'client',
        token,
        user,
        profile: {
          full_name: user.displayName || '',
          avatar_url: user.photoURL || '',
          role: user.email?.includes('admin') ? 'admin' : 'client'
        }
      };
    },

    register: async (data: any) => {
      const user = await firebaseAuthService.registerWithEmail(
        data.email,
        data.password,
        data.clientName || data.name
      );

      return { success: true, user };
    },

    updateProfile: async (userId: string, data: { name?: string; avatar_url?: string }) => {
      const auth = getFirebaseAuth();

      if (!auth?.currentUser || auth.currentUser.uid !== userId) {
        throw new Error('Usuario autenticado nao encontrado para atualizar o perfil.');
      }

      await firebaseAuthService.updateUserProfile(auth.currentUser, data);
      return { success: true };
    },

    changePassword: async (email: string, currentPassword: string, newPassword: string) => {
      await firebaseAuthService.changePassword(email, currentPassword, newPassword);
      return { success: true };
    },

    logout: async () => {
      await firebaseAuthService.logout();
    }
  },

  project: {
    create: async (projectData: any) => {
      const auth = getFirebaseAuth();
      const user = auth?.currentUser;

      if (!user) {
        throw new Error('Usuario nao autenticado');
      }

      const db = getFirestoreDb();
      if (!db) {
        throw new Error('Firestore nao configurado.');
      }

      const docRef = await addDoc(collection(db, 'projects'), {
        userId: user.uid,
        clientEmail: projectData.email,
        name: projectData.projectName,
        createdAt: serverTimestamp()
      });

      return { id: docRef.id, success: true };
    },

    getById: async (_id: string) => {
      throw new Error('Leitura de projetos ainda depende do backend final. A base Firebase ja esta preparada para evolucao.');
    },

    getAll: async () => {
      throw new Error('Listagem de projetos ainda depende do backend final. A base Firebase ja esta preparada para evolucao.');
    },

    update: async (id: string, updates: any) => {
      return { id, ...updates };
    },

    delete: async (_id: string) => {
      return { success: true };
    },

    createAccess: async (
      projectId: string,
      payload: {
        email: string;
        tempPassword: string;
        portalUrl: string;
        clientName: string;
        metadata?: Record<string, unknown>;
      }
    ) => {
      if (!isFirebaseConfigured) {
        throw new Error('Firebase nao configurado para preparar o acesso do cliente.');
      }

      const db = getFirestoreDb();
      if (!db) {
        throw new Error('Firestore nao inicializado.');
      }

      const inviteRef = await addDoc(collection(db, 'projectAccessInvites'), {
        projectId,
        email: payload.email,
        clientName: payload.clientName,
        portalUrl: payload.portalUrl,
        tempPassword: payload.tempPassword,
        metadata: payload.metadata || {},
        authProvisioningStatus: 'pending',
        createdAt: serverTimestamp()
      });

      return { success: true, id: inviteRef.id };
    }
  },

  client: {
    create: async (clientData: { name: string; email: string }) => clientData,
    getById: async (_id: string) => {
      throw new Error('Cliente ainda nao conectado ao backend final.');
    },
    getAll: async () => {
      throw new Error('Clientes ainda nao conectados ao backend final.');
    },
    update: async (id: string, updates: any) => ({ id, ...updates }),
    delete: async (_id: string) => ({ success: true })
  },

  task: {
    create: async (taskData: { project_id: string; name: string; description?: string }) => taskData,
    getAllForProject: async (_projectId: string) => [],
    update: async (id: string, updates: any) => ({ id, ...updates }),
    delete: async (_id: string) => ({ success: true })
  },

  invoice: {
    create: async (invoiceData: { project_id: string; amount: number; due_date?: string }) => invoiceData,
    getAllForProject: async (_projectId: string) => [],
    update: async (id: string, updates: any) => ({ id, ...updates }),
    delete: async (_id: string) => ({ success: true })
  },

  email: {
    send: async (payload: any) => sendTransactionalEmail(payload)
  },

  contact: {
    submit: async (data: ContactFormData) => submitContactForm(data)
  },

  payment: {
    create: async (amount: number, description: string, _payerEmail: string): Promise<PaymentOrder> => {
      const txId = `PH${Math.floor(Math.random() * 10000)}`.toUpperCase();
      const fallbackKey = '05379507107';
      const pixCode = generatePixCode(fallbackKey, 'PH Development', 'BRASILIA', amount, txId);

      return {
        id: txId,
        description,
        amount,
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        pixCode
      };
    },

    checkStatus: async (_paymentId: string): Promise<{ status: string }> => {
      return { status: 'pending' };
    }
  }
};
