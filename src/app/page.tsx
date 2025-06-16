import BannerSlider from '@/components/layout/MainBanners/BannerSlider';
import banners from '@/components/layout/MainBanners/bannersContent';
import NewArrivalsSection from '@/components/layout/MainBlocks/NewArrivals';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookMarked, BookOpen, BookText } from '@/components/ui/icons';
import Link from 'next/link';

// eslint-disable-next-line max-lines-per-function
export default function HomePage(): JSX.Element {
  return (
    <div>
      <Alert className="rounded-none border-yellow-400 text-yellow-1000 bg-yellow-200 dark:text-amber-900/80">
        <AlertDescription>
          Promo code you can use in cart: <strong>JUNE20</strong> for 20% discount and <strong>CODE2025</strong> for 15%
          discount
        </AlertDescription>
      </Alert>
      <div className="flex flex-col items-center px-[10px]">
        <BannerSlider banners={banners} className="my-8" />
        {/* Featured Categories */}
        <section className="w-full py-8 md:py-12 lg:py-16 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter dark:text-foreground sm:text-5xl">
                  Featured Categories
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Explore our carefully curated collection of books for all ages and interests.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
              {[
                {
                  description: 'Immerse yourself in captivating stories and imaginary worlds',
                  icon: <BookOpen className="h-8 w-8 mb-2 text-primary" />,
                  title: 'Fiction',
                },
                {
                  description: 'Expand your knowledge with informative and insightful reads',
                  icon: <BookText className="h-8 w-8 mb-2 text-primary" />,
                  title: 'Non-Fiction',
                },
                {
                  description: 'Magical stories and educational books for young readers',
                  icon: <BookMarked className="h-8 w-8 mb-2 text-primary" />,
                  title: 'Children',
                },
              ].map((category) => (
                <Card
                  className="group relative overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl"
                  key={category.title}
                >
                  <CardHeader className="p-6">
                    <div className="flex justify-center">{category.icon}</div>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-6 pt-0">
                    <Button asChild className="gap-1" variant="ghost">
                      <Link href={`/categories/${category.title.toLowerCase().replace(/\\'s/, 's')}`}>
                        Browse Collection <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <NewArrivalsSection />
      </div>
    </div>
  );
}
