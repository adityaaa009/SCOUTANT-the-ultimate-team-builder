
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Target, Users, TrendingUp, Search, Gamepad } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const features = [
    {
      icon: <Users className="h-6 w-6 text-sky-400" />,
      title: "Role-Based Analysis",
      description: "Advanced player evaluation based on specific agent roles and playstyles",
    },
    {
      icon: <Target className="h-6 w-6 text-sky-400" />,
      title: "Success Prediction",
      description: "ML-powered team composition analysis with success rate forecasting",
    },
    {
      icon: <Shield className="h-6 w-6 text-sky-400" />,
      title: "Team Synergy",
      description: "Deep insights into team chemistry and complementary playstyles",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-sky-400" />,
      title: "Performance Metrics",
      description: "Comprehensive stats tracking and performance analysis",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="hero-gradient absolute inset-0" />
        <div className="container mx-auto px-4 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center mb-6 space-x-2">
              <Search className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight">SCOUTANT</h1>
            </div>
            <p className="text-2xl text-muted-foreground mb-8">
              Build Your Perfect Valorant Team with AI-Powered Analytics
            </p>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Early Access
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose SCOUTANT?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Leverage machine learning and advanced analytics to build the perfect team composition
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="feature-card">
                <div className="flex items-start space-x-4">
                  {feature.icon}
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Preview */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="glassmorphism max-w-4xl mx-auto rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-8">Advanced Team Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-primary text-4xl font-bold mb-2">95%</div>
              <p className="text-muted-foreground">Prediction Accuracy</p>
            </div>
            <div>
              <div className="text-primary text-4xl font-bold mb-2">1000+</div>
              <p className="text-muted-foreground">Teams Analyzed</p>
            </div>
            <div>
              <div className="text-primary text-4xl font-bold mb-2">50+</div>
              <p className="text-muted-foreground">Success Metrics</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <Gamepad className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Dream Team?</h2>
          <p className="text-muted-foreground mb-8">
            Join the closed beta and be among the first to experience the future of team building in Valorant
          </p>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Request Beta Access
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
