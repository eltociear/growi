import React, { FC, useCallback } from 'react';
import PagePathNav from '../PagePathNav';
import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../client/services/AppContainer';
import TagLabels from '../Page/TagLabels';
import { toastSuccess, toastError } from '../../client/util/apiNotification';
import { apiPost } from '../../client/util/apiv1-client';
import { useSWRTagsInfo } from '../../stores/page';
import SubNavButtons from '../Navbar/SubNavButtons';

type Props = {
  appContainer:AppContainer
  pageId: string,
  path: string,
  isSignleLineMode?: boolean,
  isCompactMode?: boolean,
}


const SearchResultContentSubNavigation: FC<Props> = (props : Props) => {
  const {
    appContainer, pageId, path, isCompactMode, isSignleLineMode,
  } = props;

  const { data: tagInfoData, error: tagInfoError, mutate: mutateTagInfo } = useSWRTagsInfo(pageId);

  const tagsUpdatedHandler = useCallback(async(newTags) => {
    try {
      await apiPost('/tags.update', { pageId, tags: newTags });
      toastSuccess('updated tags successfully');
      mutateTagInfo();
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }
  }, [pageId, mutateTagInfo]);

  if (tagInfoError != null || tagInfoData == null) {
    return <></>;
  }
  const { isSharedUser } = appContainer;
  return (
    <div className={`grw-subnav container-fluid d-flex align-items-center justify-content-between ${isCompactMode ? 'grw-subnav-compact d-print-none' : ''}`}>
      {/* Left side */}
      <div className="grw-path-nav-container">
        {!isSharedUser && !isCompactMode && (
          <div className="grw-taglabels-container">
            <TagLabels tags={tagInfoData.tags} tagsUpdateInvoked={tagsUpdatedHandler} />
          </div>
        )}
        <PagePathNav pageId={pageId} pagePath={path} isCompactMode={isCompactMode} isSingleLineMode={isSignleLineMode} />
      </div>
      {/* Right side */}
      <div className="d-flex">
        <SubNavButtons isCompactMode={isCompactMode} pageId={pageId}></SubNavButtons>
      </div>
    </div>
  );
};


/**
 * Wrapper component for using unstated
 */
const SearchResultContentSubNavigationUnstatedWrapper = withUnstatedContainers(SearchResultContentSubNavigation, [AppContainer]);

// wrapping tsx component returned by withUnstatedContainers to avoid type error when this component used in other tsx components.
const SearchResultContentSubNavigationWrapper = (props) => {
  return <SearchResultContentSubNavigationUnstatedWrapper {...props}></SearchResultContentSubNavigationUnstatedWrapper>;
};
export default SearchResultContentSubNavigationWrapper;
