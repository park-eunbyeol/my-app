export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    phone: string | null
                    cafe_name: string | null
                    plan: string | null
                    interested_services: string[] | null
                    agree_privacy: boolean
                    agree_marketing: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    name?: string | null
                    phone?: string | null
                    cafe_name?: string | null
                    plan?: string | null
                    interested_services?: string[] | null
                    agree_privacy?: boolean
                    agree_marketing?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    phone?: string | null
                    cafe_name?: string | null
                    plan?: string | null
                    interested_services?: string[] | null
                    agree_privacy?: boolean
                    agree_marketing?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
