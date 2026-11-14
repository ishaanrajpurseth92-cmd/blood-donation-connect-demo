import React,{createContext,useContext,useState,useEffect,useCallback} from 'react';
import {DEMO_ACCOUNTS,authAPI} from '../services/api';
const AuthContext=createContext(null);
export const AuthProvider=({children})=>{
 const [user,setUser]=useState(null);const [token,setToken]=useState(localStorage.getItem('bdc_token'));const [role,setRole]=useState(localStorage.getItem('bdc_role')||'guest');const [loading,setLoading]=useState(true);
 const initAuth=useCallback(async()=>{const savedToken=localStorage.getItem('bdc_token');if(!savedToken){setLoading(false);return}try{const cached=JSON.parse(localStorage.getItem('bdc_user')||'null');if(cached){setUser(cached);setRole(localStorage.getItem('bdc_role')||cached.role||'donor')}else{const res=await authAPI.getProfile();const usr=res.data.user||res.data.hospital||res.data.admin;setUser(usr);setRole(res.data.type==='admin'?'superadmin':res.data.type||'donor')}}catch{localStorage.removeItem('bdc_token');localStorage.removeItem('bdc_role');localStorage.removeItem('bdc_user');setUser(null);setToken(null);setRole('guest')}finally{setLoading(false)}},[]);
 useEffect(()=>{initAuth()},[initAuth]);
 const setAuthSession=(authToken,authUser,authRole)=>{const r=authRole||authUser?.role||'donor';const account=authUser||DEMO_ACCOUNTS.donor.user;localStorage.setItem('bdc_token',authToken);localStorage.setItem('bdc_role',r);localStorage.setItem('bdc_user',JSON.stringify({...account,role:r}));setToken(authToken);setUser({...account,role:r});setRole(r)};
 const logout=()=>{['bdc_token','bdc_role','bdc_user'].forEach(k=>localStorage.removeItem(k));setUser(null);setToken(null);setRole('guest')};
 const refreshUser=async()=>{if(!token)return;try{const res=await authAPI.getProfile();const next=res.data.user||res.data.hospital||res.data.admin;if(next)setUser(next)}catch{}};
 return <AuthContext.Provider value={{user,token,role,loading,setAuthSession,logout,refreshUser,isAuthenticated:Boolean(user&&token),isDonor:role==='donor',isHospital:role==='hospital',isAdmin:role==='superadmin'||role==='admin',isDemo:true}}>{children}</AuthContext.Provider>
};
export const useAuth=()=>{const context=useContext(AuthContext);if(!context)throw new Error('useAuth must be used within AuthProvider');return context};
