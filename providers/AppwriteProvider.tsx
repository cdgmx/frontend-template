"use client";

import { Account, Client, Databases, ID, type Models, Storage } from "appwrite";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

type AppwriteContextType = {
	client: Client;
	account: Account;
	databases: Databases;
	storage: Storage;
	getFileView: (fileId: string) => string;
	uploadFile: (file: File) => Promise<Models.File>;
};

const AppwriteContext = createContext<AppwriteContextType | undefined>(
	undefined,
);

interface AppwriteProviderProps {
	children: ReactNode;
}

const requireClientEnv = (value: string | undefined, key: string): string => {
	if (!value) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return value;
};

const APPWRITE_ENDPOINT = requireClientEnv(
	process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
	"NEXT_PUBLIC_APPWRITE_ENDPOINT",
);
const APPWRITE_PROJECT_ID = requireClientEnv(
	process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
	"NEXT_PUBLIC_APPWRITE_PROJECT_ID",
);
const APPWRITE_BUCKET_ID = requireClientEnv(
	process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
	"NEXT_PUBLIC_APPWRITE_BUCKET_ID",
);

export const AppwriteProvider = ({ children }: AppwriteProviderProps) => {
	const client = useMemo(() => {
		return new Client()
			.setEndpoint(APPWRITE_ENDPOINT)
			.setProject(APPWRITE_PROJECT_ID);
	}, []);

	const contextValue = useMemo(() => {
		const account = new Account(client);
		const databases = new Databases(client);
		const storage = new Storage(client);

		const getFileView = (fileId: string) =>
			storage.getFileView(APPWRITE_BUCKET_ID, fileId);

		const uploadFile = async (file: File) =>
			storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file);

		return { client, account, databases, storage, getFileView, uploadFile };
	}, [client]);

	return (
		<AppwriteContext.Provider value={contextValue}>
			{children}
		</AppwriteContext.Provider>
	);
};

export const useAppwrite = (): AppwriteContextType => {
	const context = useContext(AppwriteContext);
	if (!context) {
		throw new Error("useAppwrite must be used within an AppwriteProvider");
	}
	return context;
};
