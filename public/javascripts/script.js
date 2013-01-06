$(function() {
  var search = $('#search-btn')
    , baseUrl = "http://elophant.com/api/v1/na/"
    , resource = $('#input-div select option:selected').val()

  search.click(function() {
    var summoner = $('#search-input').val()
      , data = {
          resource: resource
        , summonerName: summoner
      } 

    $.ajax(window.location.href, {
      type: 'POST'
    , data: JSON.stringify(data)
    , contentType: 'text/json'
    , success: function(data) {
        var tr
          , j=1
          , k=1

        $('.alert').addClass('visibility')
        $('#game-progress-table').removeClass('visibility')

        // td = $('#game-progress-table > tbody > tr').not(':first').children()

        for ( var i=0;i<data.length;i++ ) {
          if ( data[i].team === 1 ) {
            $('#team-1-summoner-'+j).html(data[i].name)
            $('#team-1-summoner-'+j+'-elo').html(data[i].elo)
            j++
          }

          else {
            $('#team-2-summoner-'+k).html(data[i].name)
            $('#team-2-summoner-'+k+'-elo').html(data[i].elo)
            k++
          }
          
          
        }
      }
    , error: function() {
        $('#game-progress-table').addClass('visibility')
        $('.alert').removeClass('visibility')
      }
    })
  })
})