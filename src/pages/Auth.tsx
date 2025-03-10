
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FingerprintIcon, Shield, Mail, Key, Eye, EyeOff, Github, Chrome, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FinancialInfoForm } from "@/components/auth/FinancialInfoForm";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showFinancialForm, setShowFinancialForm] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async () => {
    try {
      setLoading(true);

      // Step 1: Sign up the user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('User creation failed');

      // Profile is automatically created by the trigger
      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Initialize financial data
      const { error: financialError } = await supabase
        .from('financial_data')
        .insert({
          user_id: user.id,
          monthly_salary: 0,
          total_savings: 0,
          monthly_expenditure: 0,
        });

      if (financialError) {
        console.error('Financial data creation error:', financialError);
        throw financialError;
      }

      setUserId(user.id);
      setShowFinancialForm(true);
      toast({
        title: "Account created!",
        description: "Please complete your financial profile.",
      });

    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!data.user) throw new Error('Sign in failed');

      // Check if financial data exists
      const { data: financialData, error: financialError } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (financialError) throw financialError;

      if (!financialData) {
        setUserId(data.user.id);
        setShowFinancialForm(true);
        toast({
          title: "Welcome!",
          description: "Please complete your financial profile.",
        });
      } else {
        navigate("/");
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await handleSignUp();
    } else {
      await handleSignIn();
    }
  };

  const handleFinancialFormComplete = () => {
    navigate("/");
    toast({
      title: "Setup complete!",
      description: "Your financial profile has been saved.",
    });
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "OAuth Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {!showFinancialForm ? (
          <div className="glass-card p-8 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">
                <span className="text-neon">Finance</span>
                <span className="text-white">AI</span>
              </h1>
              <p className="text-white/60">
                {isSignUp ? "Create your secure account" : "Welcome back"}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-neon/80 bg-neon/5 p-3 rounded-lg border border-neon/20">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Bank-Grade Security + AI Protection</span>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <Input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="glass-input pl-12"
                        required={isSignUp}
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <Input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="glass-input pl-12"
                        required={isSignUp}
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input pl-12"
                    required
                  />
                </div>

                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input pl-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full bg-neon hover:bg-neon/90 text-midnight font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FingerprintIcon className="w-5 h-5" />
                  </motion.div>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#0D1119] text-white/40">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuth('google')}
                  className="glass-input hover:bg-white/10"
                >
                  <Chrome className="w-5 h-5 mr-2" />
                  Google
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuth('github')}
                  className="glass-input hover:bg-white/10"
                >
                  <Github className="w-5 h-5 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-neon hover:text-neon/80 text-sm"
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
            </div>
          </div>
        ) : (
          <FinancialInfoForm 
            userId={userId} 
            onComplete={handleFinancialFormComplete}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
