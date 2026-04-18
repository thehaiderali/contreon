import React from 'react';
import { Calendar } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const CreatorAbout = ({ creator }) => {
  if (!creator) return null;

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        {creator.avatarUrl ? (
          <img
            src={creator.avatarUrl}
            alt={creator.displayName}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
            {creator.displayName?.[0]?.toUpperCase() ?? 'C'}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold">{creator.displayName}</h1>
          {creator.url && (
            <p className="text-sm text-muted-foreground">contreon.com/c/{creator.url}</p>
          )}
        </div>
      </div>

      {creator.bio && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            About
          </h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {creator.bio}
          </p>
        </section>
      )}

      {creator.aboutPage && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            More about me
          </h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {creator.aboutPage}
          </p>
        </section>
      )}

      {creator.createdAt && (
        <section className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Creator since {formatDate(creator.createdAt)}</span>
        </section>
      )}

      {!creator.bio && !creator.aboutPage && (
        <p className="text-sm text-muted-foreground">
          This creator hasn't added an about section yet.
        </p>
      )}
    </div>
  );
};

export default CreatorAbout;