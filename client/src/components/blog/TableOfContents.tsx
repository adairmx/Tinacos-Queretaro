import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const articleElement = document.querySelector("article");
    if (!articleElement) return;

    const headingElements = Array.from(
      articleElement.querySelectorAll("h2, h3")
    ) as HTMLElement[];

    const extractedHeadings = headingElements
      .filter((heading) => heading.textContent)
      .map((heading, index) => {
        const id = heading.id || `heading-${index}`;
        heading.id = id;
        return {
          id,
          text: heading.textContent || "",
          level: parseInt(heading.tagName[1]),
        };
      });

    setHeadings(extractedHeadings);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -70% 0px" }
    );

    headingElements.forEach((heading) => observer.observe(heading));
    return () => {
      headingElements.forEach((heading) => observer.unobserve(heading));
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <aside className="sticky top-24 h-fit rounded-xl border border-border/50 bg-muted/40 p-5 hidden xl:block">
      <div className="flex items-center gap-2 mb-4">
        <List className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">Contenido</h3>
      </div>
      <nav className="space-y-1.5">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`block text-sm transition-all duration-200 py-0.5 border-l-2 pl-3 line-clamp-2 ${
              heading.level === 3 ? "ml-3 text-xs" : ""
            } ${
              activeId === heading.id
                ? "text-primary font-semibold border-primary"
                : "text-muted-foreground hover:text-foreground border-transparent hover:border-border"
            }`}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
