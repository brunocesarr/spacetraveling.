import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import Header from '../components/Header';
import { ConvertToDate } from '../helpers/Converts';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');

  useEffect(() => {
    setPosts(postsPagination.results);
    setNextPage(postsPagination.next_page);
  }, [postsPagination.results, postsPagination.next_page]);

  function handlePagination(): void {
    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        const formattedData = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...formattedData]);
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <Header />

      <main className={styles.contentContainer}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <time>
                    <FiCalendar />
                    {ConvertToDate(post.first_publication_date)}
                  </time>
                  <p>
                    <FiUser />
                    {post.data.author}
                  </p>
                </div>
              </a>
            </Link>
          ))}
          {nextPage && (
            <button
              className={styles.loadMorePostsButton}
              type="button"
              onClick={handlePagination}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      fetch: ['publication.title', 'publication.content'],
      pageSize: 20,
      ref: previewData?.ref ?? null,
    },
  );

  const posts: Post[] = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      },
      preview,
    },
  };
};
