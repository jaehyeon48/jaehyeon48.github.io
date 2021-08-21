import React, { useEffect } from 'react';
import { graphql } from 'gatsby';

import * as Elements from '../components/elements';
import { Layout } from '../layout';
import { PostTitle } from '../components/post-title';
import { PostDate } from '../components/post-date';
import { PostContainer } from '../components/post-container';
import { PostNavigator } from '../components/post-navigator';
import { Disqus } from '../components/disqus';
import { Utterances } from '../components/utterances';
import * as ScrollManager from '../utils/scroll';

import '../styles/code.scss';
import 'katex/dist/katex.min.css';
import './index.scss';

export default ({ data, pageContext, location }) => {
  useEffect(() => {
    ScrollManager.init()
    return () => ScrollManager.destroy();
  }, []);

  const post = data.markdownRemark;
  const metaData = data.site.siteMetadata;
  const { title, comment, siteUrl } = metaData;
  const { disqusShortName, utterances } = comment;
  const { title: postTitle, date, category } = post.frontmatter;

  return (
    <Layout location={location} title={title}>
      <div className="post-container">
        <PostTitle title={postTitle} category={category} />
        <PostDate date={date} />
        <Elements.Hr />
        <PostContainer html={post.html} />
        <Elements.Hr />
        <PostNavigator pageContext={pageContext} />
        {!!disqusShortName && (
          <Disqus
            post={post}
            shortName={disqusShortName}
            siteUrl={siteUrl}
            slug={pageContext.slug}
          />
        )}
        {!!utterances && <Utterances repo={utterances} />}
      </div>
    </Layout>
  );
}

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
        siteUrl
        comment {
          disqusShortName
          utterances
        }
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 280)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        category
      }
    }
  }
`;
