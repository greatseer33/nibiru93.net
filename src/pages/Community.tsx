import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, MessageCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PublicStoryFeed } from '@/components/community/PublicStoryFeed';
import { UserProfiles } from '@/components/community/UserProfiles';
import { LiveChat } from '@/components/community/LiveChat';

export default function Community() {
  const [activeTab, setActiveTab] = useState('stories');

  return (
    <MainLayout>
      <div className="min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display text-primary gold-glow mb-4">
              Community Hub
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with fellow writers, read public stories, and chat in real-time with the community.
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 mb-8">
              <TabsTrigger value="stories" className="gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Stories</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Members</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Live Chat</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stories">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <PublicStoryFeed />
              </motion.div>
            </TabsContent>

            <TabsContent value="members">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <UserProfiles />
              </motion.div>
            </TabsContent>

            <TabsContent value="chat">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <LiveChat />
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
