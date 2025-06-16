import type { BreadcrumbItemProps } from '@/components/layout/Nav/Breadcrumbs';

import Breadcrumbs from '@/components/layout/Nav/Breadcrumbs';
import { StyledInput } from '@/components/ui/StyledInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

export default function ContactsPage(): JSX.Element {
  const breadcrumbItems: BreadcrumbItemProps[] = [
    { href: '/', label: 'Home' },
    { href: '/contacts', isCurrentPage: true, label: 'Contact Us' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-foreground">Contact Us</h1>
        <p className="text-muted-foreground">Have questions or feedback? We&apos;d love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <Card className="col-span-1 lg:col-span-1">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4 dark:text-amber-500/80">Visit Our Store</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                <span>
                  Story Hive Book Store
                  <br />
                  828 Broadway
                  <br />
                  New York, NY 10003
                  <br />
                  United States
                </span>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary shrink-0" />
                <span>11 AM - 9 PM (Monday-Sunday)</span>
              </div>

              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary shrink-0" />
                <a className="hover:underline" href="tel:+12104781452">
                  +1 210-478-1452
                </a>
              </div>

              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary shrink-0" />
                <a className="hover:underline" href="mailto:admin@storyhive.com">
                  admin@storyhive.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4 dark:text-amber-500/80">Send us a Message</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <StyledInput id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <StyledInput id="email" placeholder="Your email" type="email" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <StyledInput id="subject" placeholder="Message subject" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  className="min-h-32 bg-card/50 border-2 border-input/90 hover:border-muted-foreground/70 focus:border-primary
                  shadow-inner shadow-black/15 focus:shadow-primary/10
                  focus:ring-2 focus:ring-primary/20 text-foreground transition-all duration-200
                  dark:bg-background/40 dark:border-muted dark:text-foreground dark:placeholder:text-muted-foreground/70
                  placeholder:text-muted-foreground/80 font-lato"
                  id="message"
                  placeholder="How can we help you?"
                />
              </div>

              <Button className="w-full md:w-auto" type="submit">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg overflow-hidden h-96 border border-border">
        <iframe
          allowFullScreen
          className="w-full h-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.5302551769554!2d-73.9913635!3d40.7329931!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2599c01bb8da3%3A0xb25f3f7031eabb12!2sStrand%20Book%20Store!5e0!3m2!1sen!2sus!4v1654169987123!5m2!1sen!2sus"
          style={{ border: 0 }}
          title="Strand Book Store Location"
        ></iframe>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 dark:text-amber-500/80">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1 dark:text-amber-200/40">Do you offer book signings or author events?</h3>
            <p className="text-muted-foreground">
              Yes, we regularly host author readings, book signings, and literary events. Check our Events page for the
              latest schedule.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1 dark:text-amber-200/40">Can I sell or donate my used books?</h3>
            <p className="text-muted-foreground">
              We buy select used books in good condition. Please bring them during store hours and our staff will
              evaluate them.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1 dark:text-amber-200/40">Do you offer shipping services?</h3>
            <p className="text-muted-foreground">
              Yes, we ship books nationwide and internationally. Shipping rates vary based on destination and order
              size.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1 dark:text-amber-200/40">Is your store wheelchair accessible?</h3>
            <p className="text-muted-foreground">
              Yes, our store is fully wheelchair accessible with ramps at the entrance and wide aisles throughout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
