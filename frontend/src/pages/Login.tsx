import React, { useState } from "react";
import { LoginAssets } from "../assets/icons/login/login";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import Footer from "../components/layout/Footer";
import LoginLanguageButton from "../components/ui/buttons/LoginLanguageButton";
import Textbox from "../components/ui/textboxes/Textbox";
import ErrorMessage from "../components/ui/ErrorMessage";
import Button from "../components/ui/buttons/Button";
import axios from 'axios';

console.log('Environment Variables:', import.meta.env);
console.log('API_BASE_URL:', import.meta.env.VITE_BASE_URL);

const API_BASE_URL = import.meta.env.VITE_BASE_URL ;

function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [nic, setNIC] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const validateNIC = (inputId: string) => {
        const idPattern = /^(\d{9}[vV]|\d{12})$/;
        if (!idPattern.test(inputId)) {
            setError('Invalid NIC, please enter a valid NIC number');
        } else {
            setError('');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputId = e.target.value;
        setNIC(inputId);
        validateNIC(inputId);
    };

    const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (error) {
            toast.error(error);
            return;
        }
        try {
            console.log('Making request to:', `${API_BASE_URL}/users/login`); 
            const response = await axios.post(`${API_BASE_URL}/users/login`, { 
                nic, 
                password 
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Login response:', response.data);
            
            if (!response.data.data) {
                throw new Error('Invalid response format from server');
            }
            
            const { role } = response.data.data;
            
            // Call the login function with the role
            await login({
                username: response.data.data.username || nic,  
                role: role,
                nic: nic
            });
            navigate('/dashboard', { replace: true });
        } catch (error: any) {
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
    
            if (error.response) {
                if (error.response.status === 500) {
                    toast.error('Server error. Please try again later.');
                    console.error('Server error details:', error.response.data);
                } else {
                    toast.error(`Login failed: ${error.response.data?.message || 'Invalid credentials'}`);
                }
            } else if (error.request) {
                toast.error('No response from server. Please check your connection.');
            } else {
                toast.error(`Error: ${error.message}`);
            }
        }
    };


    return (
    
            <div className="flex flex-col h-screen">
            {/* Language Dropdown */}
            <div className="absolute top-4 right-4 z-50">
                <LoginLanguageButton />
            </div>
            <div className="flex-1 flex flex-row items-center justify-center sm:px-0 bg-white min-h-0">
                {/* Banner */}
                <div
                    className="relative px-5 w-[450px] text-white bg-gradient-to-b from-[#6E2F74] to-[#24012B] h-[420px] pt-6 flex-shrink-0"
                    style={{
                        boxShadow: "0px 0px 35px rgba(91, 0, 91, 0.4)",
                        borderTopLeftRadius: "2px",
                        borderBottomLeftRadius: "2px",
                    }}
                >
                    <div className="flex flex-col items-center justify-center mt-10 mb-3 px-25">
                        <img className="mb-3 w-9 h-13" src={LoginAssets.gov_logo} alt="Gov Logo" />
                        <p className="mb-1 text-sm">{t('login.banner.electionCommissionSi')}</p>
                        <p className="mb-1 text-sm">{t('login.banner.electionCommissionTa')}</p>
                        <p className="text-sm">{t('login.banner.electionCommissionEn')}</p>
                    </div>

                    <div className="mt-1 mb-3 w-full flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-semibold">{t('login.banner.welcome')}</h2>
                    </div>

                    <div className="mt-1 flex w-full flex-col items-center justify-center">
                        <h5 className="text-xl font-medium text-white">{t('login.banner.systemName')}</h5>
                    </div>

                    {/* System variant: e.g., Internal or External */}
                    <div className="absolute bottom-3 w-full flex flex-col items-center justify-center">
                        <h5 className="text-xs font-medium text-white">{t('login.banner.systemVariant')}</h5>
                    </div>

                </div>
                <div className="px-8 bg-white w-[400px] h-[420px] flex-shrink-0" style={{
                    boxShadow: "0px 0px 35px rgba(91, 0, 91, 0.4)",
                    borderTopRightRadius: "2px",
                    borderBottomRightRadius: "2px"
                }}>
                    <h2 className="text-3xl font-semibold text-center mt-8 mb-3"
                        style={{
                            fontWeight: '700',
                            color: '#494848'
                        }}>
                        {t('Login.title')}
                    </h2>
                    <p className="text-gray-500 text-center text-sm mt-1 mb-7">{t('Login.subtitle')}</p>

                    <form onSubmit={onSubmitHandler} className="space-y-4"
                        onReset={() => {
                            setNIC('');
                            setPassword('');
                            setError('');
                        }}
                    >
                        {/* NIC number */}
                        <div className="space-y-1">
                            <Textbox 
                                iconName="AccountCircle" 
                                placeholder={t('Login.nic')} 
                                value={nic} 
                                onChange={handleChange} 
                                min={5} 
                                max={12} 
                                required={true} 
                                className="w-full"
                            />
                            {error && <ErrorMessage message={error} />}
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <Textbox 
                                iconName="Lock" 
                                type="password" 
                                placeholder={t('Login.password')} 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                min={5} 
                                max={20} 
                                required={true}
                                className="w-full"
                            />
                        </div>

                        <div className="pt-2">
                            <Button 
                                buttonText={t('Login.button')}
                                buttonStyle={2} 
                                className="w-full h-10" 
                                buttonType="submit" 
                            />
                        </div>
                    </form>
                </div>
            </div>
            {/* Footer */}
            <Footer bgColor="#f3f4f6" textColor="#6b7280" className="border-t border-gray-200" />
        </div>
    );
}

export default Login;
