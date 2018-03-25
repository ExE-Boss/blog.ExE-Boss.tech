/*
 * Copyright (C) 2018 ExE Boss
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";
/**
 * @typedef	{Object}	PostAuthor	The post author.
 * @property	{String}	[name=null]	The post author’s name.
 * @property	{String}	[github=null]	The post author’s GitHub username.
 */
/**
 * @typedef	{Object}	PostData	The data of this post.
 * @property	{PostAuthor}	author	The post author.
 */
(() => {
	/** @type PostData */
	const postData = JSON.parse($("#post-data").text());
	console.log(postData);
	let authorName = postData.author.name;
	if (authorName) {
		$("#author-name").text(authorName);
	}
	if (postData.author.github) {
		fetch(`https://api.github.com/users/${postData.author.github}`).then(r => r.json()).then(githubData => {
			if ('message' in githubData && /^API rate limit /.test(githubData.message)) {
				throw githubData.message;
			}
			$("#author-picture").attr("src",githubData.avatar_url);
			if (!authorName) {
				$("#author-name").text(githubData.name);
			}
		}).catch(console.warn);
	}
	const comments = $("#comments");
	if (comments.length > 0) {
		const issue = Number(comments.attr("data-issue"));
		const commentTemplate = comments.children("#comment-template").get(0);
		if (issue !== NaN && issue > 0) {
			fetch(`https://api.github.com/repos/ExE-Boss/blog.ExE-Boss.tech/issues/${issue}/comments`).then(r => r.json())
			/** @param {Array} commentData */.then(commentData => {
				if (!(commentData instanceof Array)) {
					if ('message' in commentData) {
						throw commentData.message;
					} else {
						throw JSON.stringify(commentData);
					}
				}
				commentData.forEach(comment => {
					const commentElement = $(document.importNode(commentTemplate.content,true));
					commentElement.find("#comment-author-name").text(comment.user.login);
					commentElement.find("#comment-author-picture").attr("src",comment.user.avatar_url);
					commentElement.find("#comment-text").html(markdown.toHTML(comment.body));
					comments.append(commentElement);
				});
			}).catch(console.warn);
		}
	}
})();
