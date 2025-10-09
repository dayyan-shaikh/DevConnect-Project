import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { WavyBackground } from "../components/ui/wavy-background";
import { CardHoverEffect } from "../components/ui/card-hover-effect";
import { Navbar } from "../components/Navbar";
import { AuthenticatedRoute } from "../components/ProtectedRoute";

export default function AboutPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const features = [
    {
      title: "🚀 Who We Are",
      description: "A community-driven space for developers to showcase their skills, projects, and professional journeys in a modern and visually engaging way.",
      icon: "👥"
    },
    {
      title: "🎯 Our Mission",
      description: "To empower developers with tools to highlight their strengths and create a collaborative space for tech enthusiasts to connect and inspire each other.",
      icon: "🎯"
    },
    {
      title: "💡 What Makes Us Different",
      description: "Developer-first approach with modern UI/UX, community-driven discovery, and built with technologies like React, NestJS, and TailwindCSS.",
      icon: "✨"
    }
  ];

  const futureFeatures = [
    { title: "🏆 Gamification", description: "Badges, achievements, and endorsements" },
    { title: "👥 Collaboration Tools", description: "Team up on projects directly from profiles" },
    { title: "📊 Analytics", description: "Track profile views and skill trends" },
    { title: "📨 Networking", description: "Chat directly with developers and recruiters" },
    { title: "🤝 Job Integration", description: "Apply for jobs through your profile" },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />
      <AuthenticatedRoute>
        <div className="relative z-10">
          {/* Hero Section */}
          <WavyBackground className="w-full h-screen flex items-center justify-center">
            <div className="max-w-4xl mx-auto text-center px-4">
              <motion.h1 
                className="text-5xl md:text-7xl font-bold text-white mb-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
              >
                About DevConnect
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 mb-8"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } },
                }}
              >
                Connecting developers, building the future
              </motion.p>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } },
                }}
                className="flex gap-4 justify-center"
              >
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Explore Features
                </Button>
              </motion.div>
            </div>
          </WavyBackground>

          {/* Features Section */}
          <section className="py-16 w-full px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                className="text-center mb-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <h2 className="text-4xl font-bold mb-4">Why Choose DevConnect?</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  We're building more than just a platform - we're creating a community where developers can truly shine.
                </p>
              </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Features */}
      <section className="py-16 w-full bg-gradient-to-r from-blue-900/30 to-indigo-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-4xl font-bold mb-4">What's Coming Next</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're constantly working on new features to make DevConnect even better.
            </p>
          </motion.div>

          <CardHoverEffect items={futureFeatures} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-indigo-500/10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] opacity-5" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center px-4 py-16">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to showcase your work?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who are already building their professional presence on DevConnect.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Get Started for Free
            </Button>
            <Button size="lg" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-900/30">
              Learn More
            </Button>
          </div>
        </div>
      </section>
        </div>
      </AuthenticatedRoute>
    </div>
  );
}
