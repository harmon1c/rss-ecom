import type { Metadata } from 'next';

import { Award, Book, Clock, Mail, Map, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  description: 'Learn about Story Hive, our mission, values and the team behind your favorite bookstore.',
  title: 'About Us | Story Hive',
};

export default function AboutPage(): React.JSX.Element {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 dark:text-foreground">About Story Hive</h1>
          <p className="text-xl text-muted-foreground mb-8">Your gateway to literary adventures since 2023</p>
          <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden">
            <Image alt="Story Hive Bookstore" className="object-cover" fill priority src="/img/png/store.jpg" />
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4 dark:text-foreground">Our Story</h2>
            <p className="mb-4 text-muted-foreground">
              Story Hive was born from a simple yet powerful idea – to create a space where book lovers could discover
              new literary worlds and connect with like-minded readers. Founded in 2023, our online bookstore has
              quickly grown into a beloved community hub for bibliophiles.
            </p>
            <p className="mb-4 text-muted-foreground">
              What started as a small collection curated by avid readers has expanded into a comprehensive library
              spanning countless genres. Through our careful selection process, we ensure that every book on our virtual
              shelves offers something special to our customers.
            </p>
            <p className="text-muted-foreground">
              Today, Story Hive stands as a testament to our commitment to fostering literacy, sparking imagination, and
              building a community united by the love of reading.
            </p>
          </div>
          <div className="md:w-1/2">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-6 rounded-lg">
                <Book className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-medium text-lg mb-2 dark:text-amber-200">10,000+ Titles</h3>
                <p className="text-sm text-muted-foreground">Carefully curated collection spanning all major genres</p>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg">
                <Clock className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-medium text-lg mb-2 dark:text-amber-200">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">Books at your doorstep within 2-3 business days</p>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-medium text-lg mb-2 dark:text-amber-200">Community</h3>
                <p className="text-sm text-muted-foreground">Join thousands of readers in our growing community</p>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg">
                <Award className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-medium text-lg mb-2 dark:text-amber-200">Quality</h3>
                <p className="text-sm text-muted-foreground">Highest quality books and customer service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Values */}
      <section className="mb-16 bg-muted/30 py-12 px-6 rounded-lg">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 dark:text-foreground">Our Mission & Values</h2>
          <p className="mb-8 text-muted-foreground">
            At Story Hive, we believe that books have the power to educate, inspire, and transform lives. Our mission is
            to make quality literature accessible to everyone and foster a lifelong love of reading.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4">
              <h3 className="font-bold text-xl mb-2 dark:text-amber-200">Diversity</h3>
              <p className="text-sm text-muted-foreground">
                We celebrate diverse voices and perspectives in literature, ensuring our collection represents a wide
                range of authors and experiences.
              </p>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-xl mb-2 dark:text-amber-200">Accessibility</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;re committed to making reading accessible to everyone through competitive pricing and
                user-friendly digital experiences.
              </p>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-xl mb-2 dark:text-amber-200">Community</h3>
              <p className="text-sm text-muted-foreground">
                We foster meaningful connections between readers, authors, and stories through our online platform and
                special events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="mb-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center dark:text-foreground">Get In Touch</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <Mail className="h-10 w-10 mx-auto text-primary mb-4" />
              <h3 className="font-medium mb-2 dark:text-amber-200">Email Us</h3>
              <a className="hover:underline" href="mailto:admin@storyhive.com">
                admin@storyhive.com
              </a>
            </div>
            <div className="p-4">
              <Map className="h-10 w-10 mx-auto text-primary mb-4" />
              <h3 className="font-medium mb-2 dark:text-amber-200">Visit Us</h3>
              <span>
                828 Broadway
                <br />
                New York, NY 10003
                <br />
                United States
              </span>
            </div>
            <div className="p-4">
              <Clock className="h-10 w-10 mx-auto text-primary mb-4" />
              <h3 className="font-medium mb-2 dark:text-amber-200">Online Hours</h3>
              <p className="text-muted-foreground">
                <span>11 AM - 9 PM (Monday-Sunday)</span>
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
              href="/contacts"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
