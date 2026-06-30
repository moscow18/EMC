'use client';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { User, Mail, Calendar, Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function DesignSystemPage() {
  const t = useTranslations('Doctors'); // using a random namespace just for testing translations if needed

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center">
            <h1 className="font-outfit text-4xl md:text-5xl font-bold text-dark mb-4">EMC Clinic Design System</h1>
            <p className="text-gray-500 text-lg">Premium Medical UI Components & Typography</p>
          </div>

          <section>
            <h2 className="font-outfit text-2xl font-bold text-dark mb-6 border-b pb-2">Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Primary (Teal)', color: 'bg-primary' },
                { name: 'Primary Light', color: 'bg-primary-light' },
                { name: 'Primary Dark', color: 'bg-primary-dark' },
                { name: 'Secondary (Slate)', color: 'bg-secondary' },
                { name: 'Accent (Sky)', color: 'bg-accent' },
                { name: 'Dark', color: 'bg-dark' },
                { name: 'Gray 100', color: 'bg-gray-100', text: 'text-dark' },
                { name: 'Success', color: 'bg-success' },
              ].map((c) => (
                <div key={c.name} className="flex flex-col items-center">
                  <div className={`w-full h-24 rounded-2xl shadow-sm ${c.color} mb-2`}></div>
                  <span className={`text-sm font-medium ${c.text || 'text-gray-600'}`}>{c.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-outfit text-2xl font-bold text-dark mb-6 border-b pb-2">Typography</h2>
            <Card className="p-8 space-y-6">
              <div>
                <h1 className="font-outfit text-5xl font-bold">Heading 1 - Outfit Bold 5xl</h1>
                <p className="text-sm text-gray-400 mt-1">Used for main page titles.</p>
              </div>
              <div>
                <h2 className="font-outfit text-3xl font-bold">Heading 2 - Outfit Bold 3xl</h2>
                <p className="text-sm text-gray-400 mt-1">Used for section titles.</p>
              </div>
              <div>
                <h3 className="font-outfit text-xl font-bold">Heading 3 - Outfit Bold xl</h3>
                <p className="text-sm text-gray-400 mt-1">Used for card titles.</p>
              </div>
              <div>
                <p className="text-base text-gray-600">Paragraph - Inter Regular base. Used for standard body copy, descriptions, and longer text passages to ensure maximum readability.</p>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="font-outfit text-2xl font-bold text-dark mb-6 border-b pb-2">Buttons</h2>
            <Card className="p-8 flex flex-wrap gap-6 items-center">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">Variants</h3>
                <div className="flex gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">Sizes</h3>
                <div className="flex items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">States & Icons</h3>
                <div className="flex gap-4">
                  <Button isLoading>Loading</Button>
                  <Button leftIcon={<Search className="w-4 h-4" />}>Search</Button>
                </div>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="font-outfit text-2xl font-bold text-dark mb-6 border-b pb-2">Inputs & Form Elements</h2>
            <Card className="p-8 max-w-2xl space-y-6">
              <Input placeholder="Enter your full name" icon={User} />
              <Input placeholder="Enter your email" icon={Mail} error="Invalid email address" />
              <Select
                icon={Calendar}
                placeholder="Select a department"
                options={[
                  { value: 'cardiology', label: 'Cardiology' },
                  { value: 'dentistry', label: 'Dentistry' },
                ]}
              />
            </Card>
          </section>

          <section>
            <h2 className="font-outfit text-2xl font-bold text-dark mb-6 border-b pb-2">Badges & Avatars</h2>
            <Card className="p-8 flex flex-wrap gap-12 items-center">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">Badges</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="primary">Cardiology</Badge>
                  <Badge variant="success">Available</Badge>
                  <Badge variant="warning">Pending</Badge>
                  <Badge variant="danger">Emergency</Badge>
                  <Badge variant="secondary">Dr. Ahmed</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">Avatars</h3>
                <div className="flex items-end gap-4">
                  <Avatar initials="AH" size="sm" />
                  <Avatar initials="SM" size="md" />
                  <Avatar initials="KI" size="lg" />
                  <Avatar initials="MD" size="xl" />
                </div>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="font-outfit text-2xl font-bold text-dark mb-6 border-b pb-2">Cards & Glassmorphism</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 h-48 flex items-center justify-center">
                <p className="text-lg font-medium text-gray-600">Standard Premium Card</p>
              </Card>
              <div className="p-8 h-48 rounded-2xl bg-gradient-to-tr from-primary to-accent relative overflow-hidden flex items-center justify-center">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                
                <Card glass className="p-6 relative z-10 w-full text-center">
                  <p className="text-lg font-bold text-dark">Glassmorphism Card</p>
                </Card>
              </div>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
